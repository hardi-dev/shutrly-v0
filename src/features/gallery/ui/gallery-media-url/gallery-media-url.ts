import type { ThumbnailSize } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";

/** The Owner-only media endpoint of a photo (D-10); the browser never sees a Drive URL. @param workspaceId - the workspace @param photoId - the photo @param size - thumb or preview @returns the relative URL */
export function galleryMediaUrl(workspaceId: string, photoId: string, size: ThumbnailSize): string {
  return `/api/w/${workspaceId}/gallery-photos/${photoId}/${size}`;
}
