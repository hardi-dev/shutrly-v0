import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { MediaViewerItem } from "@/ui/patterns/media-viewer/media-viewer.types";

import { useGoogleImages } from "../gallery-image-sources/gallery-image-context";
import { imageSources } from "../gallery-image-sources/gallery-image-sources";

type ViewerSize = "stage" | "thumb";

/** Gives the media viewer each photo's image URLs: Google first, the Owner media route as the fallback (D-22). @param photos - the photos the viewer can step through @param workspaceId - the workspace, for the fallback route @returns the viewer's `imageSrc` and `imageFallbackSrc` */
export function usePreviewImages(photos: readonly GalleryPhotoView[], workspaceId: string) {
  const googleImages = useGoogleImages();
  const sourcesOf = (item: MediaViewerItem, size: ViewerSize) => {
    const photo = photos.find((candidate) => candidate.id === item.id);
    return imageSources(
      { id: item.id, externalFileId: photo?.externalFileId ?? "" },
      size === "stage" ? "preview" : "thumb",
      workspaceId,
      googleImages,
    );
  };
  return {
    imageSrc: (item: MediaViewerItem, size: ViewerSize) => sourcesOf(item, size).src,
    imageFallbackSrc: (item: MediaViewerItem, size: ViewerSize) =>
      sourcesOf(item, size).fallbackSrc,
  };
}
