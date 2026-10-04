import type {
  GalleryPageView,
  GalleryPhotoView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryPhotosSectionProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly browseAction: GalleryPageActions["browseAction"];
  readonly onOpenPhoto?: (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => void;
}

export interface PreviewTileProps {
  readonly workspaceId: string;
  readonly photo: GalleryPhotoView;
  readonly list: readonly GalleryPhotoView[];
  readonly onOpenPhoto: GalleryPhotosSectionProps["onOpenPhoto"];
}

export interface PreviewBodyProps extends GalleryPhotosSectionProps {
  readonly isMobile: boolean;
}
