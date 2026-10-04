import "server-only";

import {
  canArchive,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/** Archives a published or expired gallery; final and read-only afterwards (BR-GAL-005, BR-GAL-009, AC-GAL-022). @param deps - repository and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function archiveGallery(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
): Promise<GalleryWriteResult> {
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    galleryId,
    async (gallery, writer) => {
      if (!canArchive(effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now))) {
        return galleryFailure("INVALID_STATE");
      }
      await writer.archive(actorId, deps.now);
      return { ok: true };
    },
  );
}
