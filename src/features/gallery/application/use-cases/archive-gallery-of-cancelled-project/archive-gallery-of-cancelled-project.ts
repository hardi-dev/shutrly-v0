import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { CancelledProjectGalleryDeps } from "./archive-gallery-of-cancelled-project.types";

/**
 * Cancelling no longer writes the gallery: its state is CLOSED from the project status (AC-GFL-016,
 * ADR-028). Returns false (nothing archived) until iteration 3 deletes this use case.
 * @param deps - repository and clock, bound to the cancel transaction
 * @param context - verified workspace
 * @param actorId - the signed-in owner (unused since F-27)
 * @param projectId - the cancelled project
 * @returns always false
 */
export function archiveGalleryOfCancelledProject(
  deps: CancelledProjectGalleryDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<boolean> {
  return deps.sources.findGalleryIdByProject(context, projectId).then(() => false);
}
