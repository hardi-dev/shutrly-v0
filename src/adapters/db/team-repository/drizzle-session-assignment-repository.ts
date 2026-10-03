import "server-only";

import { and, eq } from "drizzle-orm";

import type {
  AssignmentChange,
  SessionAssignmentRepositoryPort,
} from "@/features/booking/application/ports/session-assignment-repository/session-assignment-repository.port";
import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { pgCode } from "../catalog-repository/pg-error";
import type { DbExecutor } from "../client/client.types";
import { project, projectSession } from "../schema/booking/project";
import { sessionAssignment, teamMember, teamMemberRole, teamRole } from "../schema/booking/team";

const DUPLICATE_KEY = "23505";

// D-4 step 1: the project row is the serialization point for every assignment write.
async function lockProjectStatus(tx: DbExecutor, context: WorkspaceContext, projectId: string) {
  const row = (
    await tx
      .select({ status: project.status })
      .from(project)
      .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)))
      .for("update")
  ).at(0);
  return PROJECT_STATUSES.find((candidate) => candidate === row?.status);
}

async function sessionInProject(
  tx: DbExecutor,
  context: WorkspaceContext,
  change: AssignmentChange,
) {
  const rows = await tx
    .select({ id: projectSession.id })
    .from(projectSession)
    .where(
      and(
        eq(projectSession.workspaceId, context.workspaceId),
        eq(projectSession.projectId, change.projectId),
        eq(projectSession.id, change.sessionId),
      ),
    );
  return rows.length > 0;
}

// FOR SHARE keeps a concurrent archive or role change (which locks the member FOR UPDATE) out.
async function lockMember(tx: DbExecutor, context: WorkspaceContext, memberId: string) {
  return (
    await tx
      .select({ archivedAt: teamMember.archivedAt })
      .from(teamMember)
      .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, memberId)))
      .for("share")
  ).at(0);
}

async function roleCheck(tx: DbExecutor, context: WorkspaceContext, change: AssignmentChange) {
  const role = await tx
    .select({ id: teamRole.id })
    .from(teamRole)
    .where(and(eq(teamRole.workspaceId, context.workspaceId), eq(teamRole.id, change.roleId)));
  if (role.length === 0) return "NOT_FOUND" as const;
  const held = await tx
    .select({ roleId: teamMemberRole.roleId })
    .from(teamMemberRole)
    .where(
      and(
        eq(teamMemberRole.workspaceId, context.workspaceId),
        eq(teamMemberRole.memberId, change.memberId),
        eq(teamMemberRole.roleId, change.roleId),
      ),
    );
  return held.length > 0 ? ("HELD" as const) : ("ROLE_NOT_HELD" as const);
}

async function alreadyOnSession(tx: DbExecutor, change: AssignmentChange) {
  const rows = await tx
    .select({ id: sessionAssignment.id })
    .from(sessionAssignment)
    .where(
      and(
        eq(sessionAssignment.sessionId, change.sessionId),
        eq(sessionAssignment.memberId, change.memberId),
      ),
    );
  return rows.length > 0;
}

async function addInTransaction(
  tx: DbExecutor,
  context: WorkspaceContext,
  change: AssignmentChange,
) {
  const status = await lockProjectStatus(tx, context, change.projectId);
  if (!status) return "NOT_FOUND" as const;
  if (!change.isEditable(status)) return "PROJECT_CANCELLED" as const;
  if (!(await sessionInProject(tx, context, change))) return "NOT_FOUND" as const;
  const member = await lockMember(tx, context, change.memberId);
  if (!member) return "NOT_FOUND" as const;
  if (member.archivedAt !== null) return "MEMBER_ARCHIVED" as const;
  const role = await roleCheck(tx, context, change);
  if (role !== "HELD") return role;
  if (await alreadyOnSession(tx, change)) return "ALREADY_ASSIGNED" as const;
  await tx.insert(sessionAssignment).values({
    workspaceId: context.workspaceId,
    projectId: change.projectId,
    sessionId: change.sessionId,
    memberId: change.memberId,
    roleId: change.roleId,
    updatedBy: change.actorId,
  });
  return "ADDED" as const;
}

async function addAssignment(db: DbExecutor, context: WorkspaceContext, change: AssignmentChange) {
  try {
    return await db.transaction((tx) => addInTransaction(tx, context, change));
  } catch (error) {
    // The unique index on (session, member) is the backstop for the check above.
    if (pgCode(error) === DUPLICATE_KEY) return "ALREADY_ASSIGNED" as const;
    throw error;
  }
}

/**
 * Drizzle implementation of the session-assignment port.
 * @param db - the request database or a transaction
 * @returns a repository scoped by the context passed to each call
 */
export function createDrizzleSessionAssignmentRepository(
  db: DbExecutor,
): SessionAssignmentRepositoryPort {
  return { add: (context, change) => addAssignment(db, context, change) };
}
