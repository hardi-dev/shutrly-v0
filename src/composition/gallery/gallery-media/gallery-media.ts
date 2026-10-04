import "server-only";

import { notFound } from "next/navigation";

import type { ThumbnailSize } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { serveOwnerPhoto } from "@/features/gallery/application/use-cases/serve-owner-photo/serve-owner-photo";
import { logger } from "@/shared/logging/logger";

import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { galleryIdOrNotFound } from "../gallery-flow-support/gallery-flow-support";
import { withGalleryScope } from "../gallery-scope/gallery-scope";

const SIZES: readonly ThumbnailSize[] = ["thumb", "preview"];

// D-10: a short private browser cache, never a shared one (C-103).
export const OWNER_MEDIA_HEADERS = {
  "Cache-Control": "private, max-age=600",
  "X-Content-Type-Options": "nosniff",
} as const;

/** Streams a photo thumbnail to the signed-in Owner of its workspace; anything else is an empty 404 (D-10, AC-GAL-015, AC-GAL-025). @param rawWorkspaceId - untrusted workspace id @param rawPhotoId - untrusted photo id @param rawSize - untrusted size @returns the image response */
export async function serveOwnerPhotoEntry(
  rawWorkspaceId: string,
  rawPhotoId: string,
  rawSize: string,
): Promise<Response> {
  const size = SIZES.find((candidate) => candidate === rawSize);
  if (!size) notFound();
  const photoId = galleryIdOrNotFound(rawPhotoId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    const image = await withGalleryScope((scope) =>
      serveOwnerPhoto(scope, verified.context, photoId, size),
    );
    if (!image.ok) notFound();
    return new Response(image.body, {
      headers: { ...OWNER_MEDIA_HEADERS, "Content-Type": image.contentType },
    });
  } catch (error) {
    if (error instanceof Error && "digest" in error) throw error;
    logger.error("gallery.media_failed", { workspaceId: verified.context.workspaceId, photoId });
    notFound();
  }
}
