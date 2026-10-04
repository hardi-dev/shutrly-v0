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

/** Removes a folder: its photos are hidden, not deleted; a published or expired gallery keeps at least one active folder (BR-GAL-009, A-6, AC-GAL-013). @param deps - repository and clock @param context - verified workspace @param actorId - the signed-in owner @param sourceId - the gallery source id @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's source */
export async function removeGallerySource(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  actorId: string,
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
      const removed = await writer.removeSource(sourceId, actorId, deps.now);
      return removed ? { ok: true } : galleryFailure("INVALID_STATE");
    },
  );
}
