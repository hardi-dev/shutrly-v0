import type {
  GalleryPageScreenView,
  GalleryPhotoView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryPhotosSectionProps {
  readonly workspaceId: string;
  readonly page: GalleryPageScreenView;
  readonly browseAction: GalleryPageActions["browseAction"];
}

export interface PreviewTileProps {
  readonly workspaceId: string;
  readonly photo: GalleryPhotoView;
  readonly list: readonly GalleryPhotoView[];
  readonly onOpenPhoto: PreviewBodyProps["onOpenPhoto"];
}

export interface PreviewBodyProps extends GalleryPhotosSectionProps {
  readonly onOpenPhoto: (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => void;
}

export interface ViewAllButtonProps {
  readonly onPress: () => void;
}
