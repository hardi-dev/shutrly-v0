import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  ThumbnailResult,
  ThumbnailSize,
} from "../../ports/gallery-source-provider/gallery-source-provider.port";
import type { ServeOwnerPhotoDeps } from "./serve-owner-photo.types";

/** Fetches a photo's thumbnail for the Owner through the provider, so no key or Drive URL reaches the browser (BR-SRC-003, BR-ACC-005, D-10, AC-GAL-015). @param deps - gallery repository and provider @param context - verified workspace @param photoId - the photo id @param size - thumb or preview @returns the image, or not ok for another workspace's, missing or removed photo */
export async function serveOwnerPhoto(
  deps: ServeOwnerPhotoDeps,
  context: WorkspaceContext,
  photoId: string,
  size: ThumbnailSize,
): Promise<ThumbnailResult> {
  const photo = await deps.galleries.findMediaPhoto(context, photoId);
  if (!photo || photo.missing || photo.sourceRemoved) return { ok: false };
  return deps.provider.thumbnail(
    { fileId: photo.externalFileId, resourceKey: photo.resourceKey },
    size,
  );
}
