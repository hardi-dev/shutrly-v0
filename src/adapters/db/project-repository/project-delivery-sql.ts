import "server-only";

import { and, eq } from "drizzle-orm";

import type { MoveStatusResult } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";

const scopeOf = (context: WorkspaceContext, id: string) =>
  and(eq(project.workspaceId, context.workspaceId), eq(project.id, id));

/** Locks the project row FOR UPDATE and reads its status; the final-delivery scope takes this lock before the gallery's (F-10 D-17). @param db - the transaction @param context - verified workspace @param id - the project id @returns the status, or null outside the workspace */
export async function lockProjectStatus(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
): Promise<ProjectStatus | null> {
  const rows = await db
    .select({ status: project.status })
    .from(project)
    .where(scopeOf(context, id))
    .for("update");
  return PROJECT_STATUSES.find((status) => status === rows.at(0)?.status) ?? null;
}

/** Moves a DELIVERED project to COMPLETED with who and when (BR-PRJ-005, BR-AUD-001). @param db - the executor @param context - verified workspace @param id - the project id @param actorId - the Owner @param at - when @returns MOVED, STALE when not DELIVERED, or NOT_FOUND */
export async function markProjectCompleted(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
  actorId: string,
  at: Date,
): Promise<MoveStatusResult> {
  const moved = await db
    .update(project)
    .set({
      status: "COMPLETED",
      completedAt: at,
      completedBy: actorId,
      updatedBy: actorId,
      updatedAt: at,
    })
    .where(and(scopeOf(context, id), eq(project.status, "DELIVERED")))
    .returning({ id: project.id });
  if (moved.length > 0) return "MOVED";
  const existing = await db.select({ id: project.id }).from(project).where(scopeOf(context, id));
  return existing.length > 0 ? "STALE" : "NOT_FOUND";
}
