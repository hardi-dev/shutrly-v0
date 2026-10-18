import "server-only";

import { galleryState, isWritable } from "@/features/gallery/domain/gallery-state/gallery-state";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/** Deletes a folder with its photos, unless a client picked one of them; the last folder may go (BR-GAL-009, AC-GFL-015). @param deps - repository and clock @param context - verified workspace @param sourceId - the gallery source id @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's source */
export async function deleteGallerySource(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  sourceId: string,
): Promise<GalleryWriteResult> {
  const target = await deps.sources.findSyncTarget(context, sourceId);
  if (!target) throw new GalleryError("NOT_FOUND");
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    target.galleryId,
    async (gallery, writer) => {
      const state = galleryState(gallery.projectStatus, gallery.expiresAt, deps.now);
      if (!isWritable(state)) return galleryFailure("INVALID_STATE");
      if ((await writer.countSourcePicks(sourceId)) > 0) return galleryFailure("HAS_PICKS");
      const deleted = await writer.deleteSource(sourceId, deps.now);
      return deleted ? { ok: true } : galleryFailure("INVALID_STATE");
    },
  );
}
