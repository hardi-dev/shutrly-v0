import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withGalleryLock } from "../gallery-lock/gallery-lock";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { PublishResult } from "../gallery-results/gallery-results.types";
import type { PublishGalleryDeps } from "./publish-gallery.types";

/**
 * Refuses: a gallery has no publish step (ADR-028, AC-GFL-006). Kept compiling only until iteration 3
 * deletes this use case with its UI action; its writer is gone since iteration 2.
 * @param deps - repository
 * @param context - verified workspace
 * @param actorId - the signed-in owner
 * @param galleryId - the gallery id
 * @returns always an INVALID_STATE failure
 */
export async function publishGallery(
  deps: PublishGalleryDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
): Promise<PublishResult> {
  return withGalleryLock<PublishResult>(deps.sources, context, galleryId, () =>
    Promise.resolve(galleryFailure("INVALID_STATE")),
  );
}
