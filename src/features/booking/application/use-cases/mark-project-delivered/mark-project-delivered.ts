import "server-only";

import { canMarkDelivered } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import type { ProjectDeliveryResult } from "./mark-project-delivered.types";

/**
 * Locks the project first and moves it to DELIVERED when final delivery is published; never to
 * COMPLETED (BR-DEL-003, BR-PRJ-004, F-10 D-17). Runs inside the final-delivery scope.
 * @param projects - project repository bound to the scope's transaction
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @returns undefined, or PROJECT_STATUS
 * @throws ProjectError NOT_FOUND for a project outside the workspace
 */
export async function markProjectDelivered(
  projects: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<ProjectDeliveryResult> {
  const status = await projects.lockStatus(context, projectId);
  if (!status) throw new ProjectError("NOT_FOUND");
  if (!canMarkDelivered(status)) return { ok: false, code: "PROJECT_STATUS" };
  const moved = await projects.moveStatus(
    context,
    projectId,
    { from: status, to: "DELIVERED" },
    actorId,
  );
  return moved === "MOVED" ? undefined : { ok: false, code: "PROJECT_STATUS" };
}
