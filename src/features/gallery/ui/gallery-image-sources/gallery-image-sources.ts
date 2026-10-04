import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import {
  GOOGLE_IMAGE_WIDTHS,
  googleImageUrl,
} from "@/features/gallery/domain/google-image-url/google-image-url";

import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import type { ImageSize, ImageSources } from "./gallery-image-sources.types";

const WIDTHS: Readonly<Record<ImageSize, number>> = {
  thumb: GOOGLE_IMAGE_WIDTHS.tile,
  preview: GOOGLE_IMAGE_WIDTHS.preview,
};

/** Picks where a photo's image loads from: Google's image URL by file ID with the Owner-only media route as fallback, or the route alone when Google images are off (E2E) or the ID isn't a Drive ID (ADR-019 point 3, TD D-22, AC-GAL-015). @param photo - the photo view @param size - thumb or preview @param workspaceId - the workspace, for the fallback route @param googleImages - whether to load from Google first @returns the main URL and the fallback, if any */
export function imageSources(
  photo: Pick<GalleryPhotoView, "id" | "externalFileId">,
  size: ImageSize,
  workspaceId: string,
  googleImages: boolean,
): ImageSources {
  const route = galleryMediaUrl(workspaceId, photo.id, size);
  const google = googleImages ? googleImageUrl(photo.externalFileId, WIDTHS[size]) : null;
  return google === null ? { src: route } : { src: google, fallbackSrc: route };
}
