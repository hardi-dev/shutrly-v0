import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import type {
  CreateSnapshotResult,
  NewSessionInput,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { sessionAssignment, teamMember, teamMemberRole, teamRole } from "../schema/booking/team";

type Rejection = Exclude<CreateSnapshotResult, { status: "CREATED" }>;

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

// D-4 for a new project: the members are locked FOR SHARE, so a concurrent archive or role change waits.
async function foundMembers(tx: DbExecutor, context: WorkspaceContext, ids: string[]) {
  return tx
    .select({ id: teamMember.id, archivedAt: teamMember.archivedAt })
    .from(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), inArray(teamMember.id, ids)))
    .for("share");
}

async function foundRoles(tx: DbExecutor, context: WorkspaceContext, ids: string[]) {
  return tx
    .select({ id: teamRole.id })
    .from(teamRole)
    .where(and(eq(teamRole.workspaceId, context.workspaceId), inArray(teamRole.id, ids)));
}

async function heldPairs(tx: DbExecutor, context: WorkspaceContext, memberIds: string[]) {
  const rows = await tx
    .select({ memberId: teamMemberRole.memberId, roleId: teamMemberRole.roleId })
    .from(teamMemberRole)
    .where(
      and(
        eq(teamMemberRole.workspaceId, context.workspaceId),
        inArray(teamMemberRole.memberId, memberIds),
      ),
    );
  return new Set(rows.map((row) => `${row.memberId}:${row.roleId}`));
}

function firstInvalidSession(
  sessions: readonly NewSessionInput[],
  archived: ReadonlySet<string>,
  held: ReadonlySet<string>,
): number | null {
  const index = sessions.findIndex((session) =>
    session.team.some(
      (pick) => archived.has(pick.memberId) || !held.has(`${pick.memberId}:${pick.roleId}`),
    ),
  );
  return index < 0 ? null : index;
}

/**
 * Checks every pick of a new project's sessions before anything is written (AC-TEAM-028): the
 * members and roles are in the workspace (otherwise `NOT_FOUND`), the members are active and hold
 * the role (otherwise `TEAM_INVALID` with the session's position).
 * @param tx - the creating transaction
 * @param context - verified workspace
 * @param sessions - the new sessions with their picks
 * @returns the refusal, or null when the teams can be saved
 */
export async function checkTeams(
  tx: DbExecutor,
  context: WorkspaceContext,
  sessions: readonly NewSessionInput[],
): Promise<Rejection | null> {
  const picks = sessions.flatMap((session) => session.team);
  if (picks.length === 0) return null;
  const memberIds = unique(picks.map((pick) => pick.memberId));
  const roleIds = unique(picks.map((pick) => pick.roleId));
  const members = await foundMembers(tx, context, memberIds);
  const roles = await foundRoles(tx, context, roleIds);
  if (members.length !== memberIds.length || roles.length !== roleIds.length) {
    return { status: "NOT_FOUND" };
  }
  const archived = new Set(members.filter((m) => m.archivedAt !== null).map((m) => m.id));
  const held = await heldPairs(tx, context, memberIds);
  const sessionIndex = firstInvalidSession(sessions, archived, held);
  return sessionIndex === null ? null : { status: "TEAM_INVALID", sessionIndex };
}

/**
 * Inserts the assignments of the sessions just created, in pick order within each session (A-4).
 * @param tx - the creating transaction
 * @param context - verified workspace
 * @param target - the project, its new session IDs in input order and the sessions' picks
 * @returns nothing
 */
export async function insertTeams(
  tx: DbExecutor,
  context: WorkspaceContext,
  target: {
    readonly projectId: string;
    readonly sessionIds: readonly string[];
    readonly sessions: readonly NewSessionInput[];
    readonly actorId: string;
  },
): Promise<void> {
  const start = Date.now();
  const rows = target.sessions.flatMap((session, index) =>
    session.team.map((pick) => ({
      workspaceId: context.workspaceId,
      projectId: target.projectId,
      sessionId: target.sessionIds[index] ?? "",
      memberId: pick.memberId,
      roleId: pick.roleId,
      updatedBy: target.actorId,
    })),
  );
  if (rows.length === 0) return;
  // One transaction shares one now(); distinct times keep the stored order stable.
  await tx
    .insert(sessionAssignment)
    .values(rows.map((row, i) => ({ ...row, createdAt: new Date(start + i) })));
}
