import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/**
 * Refuses: a gallery is not archived any more (ADR-028, AC-GFL-006). Kept compiling only until
 * iteration 3 deletes this use case.
 * @param deps - repository and clock
 * @param context - verified workspace
 * @param actorId - the signed-in owner
 * @param galleryId - the gallery id
 * @returns always an INVALID_STATE failure
 */
export async function archiveGallery(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
): Promise<GalleryWriteResult> {
  return withGalleryLock<GalleryWriteResult>(deps.sources, context, galleryId, () =>
    Promise.resolve(galleryFailure("INVALID_STATE")),
  );
}
