import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { directImageUrl } from "@/features/gallery/domain/source-image/source-image";

import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import type { ImageSize, ImageSources } from "./gallery-image-sources.types";

/** Picks where a photo's image loads from: its provider's direct URL with the Owner-only media route as fallback, or the route alone when direct images are off (E2E) or the provider has no direct URL (ADR-019 point 3, TD D-22, AC-GAL-015). @param photo - the photo view @param size - thumb or preview @param workspaceId - the workspace, for the fallback route @param directImages - whether to try the provider's direct URL first @returns the main URL and the fallback, if any */
export function imageSources(
  photo: Pick<GalleryPhotoView, "id" | "externalFileId" | "provider">,
  size: ImageSize,
  workspaceId: string,
  directImages: boolean,
): ImageSources {
  const route = galleryMediaUrl(workspaceId, photo.id, size);
  const direct = directImages ? directImageUrl(photo.provider, photo.externalFileId, size) : null;
  return direct === null ? { src: route } : { src: direct, fallbackSrc: route };
}
