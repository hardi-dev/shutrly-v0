import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/**
 * Refuses: there are no drafts and no gallery deletion (ADR-028, AC-GFL-006). Kept compiling only
 * until iteration 3 deletes this use case.
 * @param deps - repository and clock
 * @param context - verified workspace
 * @param galleryId - the gallery id
 * @returns always an INVALID_STATE failure
 */
export async function deleteDraftGallery(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  galleryId: string,
): Promise<GalleryWriteResult> {
  return withGalleryLock<GalleryWriteResult>(deps.sources, context, galleryId, () =>
    Promise.resolve(galleryFailure("INVALID_STATE")),
  );
}
