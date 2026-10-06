import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import type { ProjectDeliveryResult } from "../mark-project-delivered/mark-project-delivered.types";

/**
 * *Tandai selesai*: moves a DELIVERED project to COMPLETED with who and when; invoices play no part
 * (BR-PRJ-005, BR-PRJ-006, BR-AUD-001, A-19, AC-DEL-007).
 * @param projects - project repository
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @param now - when
 * @returns undefined, or PROJECT_STATUS when the project isn't DELIVERED
 * @throws ProjectError NOT_FOUND for a project outside the workspace
 */
export async function completeProject(
  projects: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  now: Date,
): Promise<ProjectDeliveryResult> {
  const moved = await projects.markCompleted(context, projectId, actorId, now);
  if (moved === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return moved === "MOVED" ? undefined : { ok: false, code: "PROJECT_STATUS" };
}
