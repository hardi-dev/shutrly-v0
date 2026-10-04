import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { MediaViewerItem } from "@/ui/patterns/media-viewer/media-viewer.types";

import { useDirectImages } from "../gallery-image-sources/gallery-image-context";
import { imageSources } from "../gallery-image-sources/gallery-image-sources";

type ViewerSize = "stage" | "thumb";

/** Gives the media viewer each photo's image URLs: Google first, the Owner media route as the fallback (D-22). @param photos - the photos the viewer can step through @param workspaceId - the workspace, for the fallback route @returns the viewer's `imageSrc` and `imageFallbackSrc` */
export function usePreviewImages(photos: readonly GalleryPhotoView[], workspaceId: string) {
  const directImages = useDirectImages();
  const sourcesOf = (item: MediaViewerItem, size: ViewerSize) => {
    const photo = photos.find((candidate) => candidate.id === item.id);
    return imageSources(
      {
        id: item.id,
        externalFileId: photo?.externalFileId ?? "",
        provider: photo?.provider ?? "GOOGLE_DRIVE",
      },
      size === "stage" ? "preview" : "thumb",
      workspaceId,
      directImages,
    );
  };
  return {
    imageSrc: (item: MediaViewerItem, size: ViewerSize) => sourcesOf(item, size).src,
    imageFallbackSrc: (item: MediaViewerItem, size: ViewerSize) =>
      sourcesOf(item, size).fallbackSrc,
  };
}
