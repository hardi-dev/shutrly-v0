import "server-only";

import { directImageUrl } from "@/features/gallery/domain/source-image/source-image";
import type { ImageSize } from "@/features/gallery/domain/source-image/source-image.types";

import type { ClientImage, ClientPhotoSource, ClientPhotoView } from "./client-views.types";

/** The client media route of a photo, under the token path so the session cookie goes with it (D-2, D-15). @param token - the client access token @param photoId - the photo id @param size - thumb or preview @returns the same-origin path */
export function clientMediaUrl(token: string, photoId: string, size: ImageSize): string {
  return `/g/${token}/media/${photoId}/${size}`;
}

function imageOf(
  photo: ClientPhotoSource,
  token: string,
  size: ImageSize,
  directImages: boolean,
): ClientImage {
  const route = clientMediaUrl(token, photo.id, size);
  const direct = directImages ? directImageUrl(photo.provider, photo.externalFileId, size) : null;
  return direct === null ? { src: route } : { src: direct, fallbackSrc: route };
}

/** Builds the client view of a photo: Google's image host by file ID first, the client media route as fallback, and nothing else (ADR-019, D-15, AC-ACC-012/013). @param photo - the photo facts @param token - the client access token @param directImages - whether direct provider images are on (off under the E2E fixture) @returns the view */
export function toClientPhotoView(
  photo: ClientPhotoSource,
  token: string,
  directImages: boolean,
): ClientPhotoView {
  return {
    id: photo.id,
    fileName: photo.fileName,
    folderPath: photo.folderPath,
    thumb: imageOf(photo, token, "thumb", directImages),
    preview: imageOf(photo, token, "preview", directImages),
    missing: photo.missing,
  };
}
