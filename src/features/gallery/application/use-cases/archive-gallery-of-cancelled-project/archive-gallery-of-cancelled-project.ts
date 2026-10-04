import "server-only";

import { effectiveGalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { CancelledProjectGalleryDeps } from "./archive-gallery-of-cancelled-project.types";

/** Archives a published or expired gallery when its project is cancelled, in the cancel transaction; a draft stays, deletable only (BR-PRJ-010, BR-GAL-005, A-8, AC-GAL-024). @param deps - repository and clock, bound to the cancel transaction @param context - verified workspace @param actorId - the signed-in owner @param projectId - the cancelled project @returns true when a gallery was archived */
export async function archiveGalleryOfCancelledProject(
  deps: CancelledProjectGalleryDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<boolean> {
  const galleryId = await deps.sources.findGalleryIdByProject(context, projectId);
  if (galleryId === null) return false;
  return withGalleryLock(deps.sources, context, galleryId, async (gallery, writer) => {
    const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
    if (status !== "PUBLISHED" && status !== "EXPIRED") return false;
    await writer.archive(actorId, deps.now);
    return true;
  });
}
