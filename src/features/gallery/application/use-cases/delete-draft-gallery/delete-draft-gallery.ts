import "server-only";

import {
  canDeleteDraft,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/** Deletes a draft with its sources and photo records; a gallery that is or was published is refused (BR-GAL-005, A-10, AC-GAL-023). @param deps - repository and clock @param context - verified workspace @param galleryId - the gallery id @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function deleteDraftGallery(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  galleryId: string,
): Promise<GalleryWriteResult> {
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    galleryId,
    async (gallery, writer) => {
      if (!canDeleteDraft(effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now))) {
        return galleryFailure("INVALID_STATE");
      }
      await writer.deleteGallery();
      return { ok: true };
    },
  );
}
