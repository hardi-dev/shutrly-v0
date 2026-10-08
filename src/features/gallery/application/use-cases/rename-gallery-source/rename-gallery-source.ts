import "server-only";

import {
  canEditSources,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { renameGallerySourceSchema } from "../../schemas/rename-gallery-source/rename-gallery-source.schema";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure, toGalleryValidationFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";

/** Renames a folder's label; an empty label shows the folder name again (BR-GAL-009, AC-GAL-037). @param deps - repository and clock @param context - verified workspace @param sourceId - the gallery source id @param input - untrusted `{ label }` @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's source */
export async function renameGallerySource(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  sourceId: string,
  input: unknown,
): Promise<GalleryWriteResult> {
  const parsed = renameGallerySourceSchema.safeParse(input);
  if (!parsed.success) return toGalleryValidationFailure(parsed.error.issues);
  const target = await deps.sources.findSyncTarget(context, sourceId);
  if (!target) throw new GalleryError("NOT_FOUND");
  const label = parsed.data.label === "" ? null : parsed.data.label;
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    target.galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canEditSources(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      const renamed = await writer.renameSource(sourceId, label, deps.now);
      return renamed ? { ok: true } : galleryFailure("INVALID_STATE");
    },
  );
}
