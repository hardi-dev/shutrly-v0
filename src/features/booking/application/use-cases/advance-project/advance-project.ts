import "server-only";

import { stepTransition } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { projectStepSchema } from "../../schemas/project-step/project-step.schema";
import type { ProjectWriteResult } from "../project-results/project-results.types";

/** Performs one manual forward step; a forged step is NOT_FOUND, a draft without a session is refused, and a status that moved meanwhile is STALE (BR-PRJ-004, AC-PRJ-009, 020, 021). @param repository - project port @param context - verified workspace @param actorId - the signed-in owner @param projectId - the project id @param rawStep - the unvalidated step @returns undefined on success or a failure result */
export async function advanceProject(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  rawStep: unknown,
): Promise<ProjectWriteResult> {
  const parsed = projectStepSchema.safeParse(rawStep);
  if (!parsed.success) throw new ProjectError("NOT_FOUND");
  const step = parsed.data;
  if (step === "CONFIRM_BOOKING") {
    const sessions = await repository.countSessions(context, projectId);
    if (sessions === null) throw new ProjectError("NOT_FOUND");
    if (sessions === 0) return { ok: false, code: "SESSION_REQUIRED" };
  }
  const moved = await repository.moveStatus(context, projectId, stepTransition(step), actorId);
  if (moved === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return moved === "STALE" ? { ok: false, code: "STALE" } : undefined;
}
