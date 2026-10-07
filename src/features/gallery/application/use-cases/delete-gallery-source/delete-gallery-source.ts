import "server-only";

import {
  canEditSources,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/** Deletes a folder with its photos, unless a client picked one of them or a published or expired gallery would lose its last active folder (BR-GAL-009, BR-GAL-004, AC-GAL-013). @param deps - repository and clock @param context - verified workspace @param sourceId - the gallery source id @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's source */
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
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canEditSources(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      const isLive = status === "PUBLISHED" || status === "EXPIRED";
      if (isLive && (await writer.countActiveSources()) <= 1)
        return galleryFailure("LAST_ACTIVE_SOURCE");
      if ((await writer.countSourcePicks(sourceId)) > 0) return galleryFailure("HAS_PICKS");
      const deleted = await writer.deleteSource(sourceId, deps.now);
      return deleted ? { ok: true } : galleryFailure("INVALID_STATE");
    },
  );
}
