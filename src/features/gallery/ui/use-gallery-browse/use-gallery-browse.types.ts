import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { BrowseLocation } from "../browse-text/browse-text.types";
import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface UseGalleryBrowseInput {
  readonly workspaceId: string;
  readonly galleryId: string;
  readonly browseAction: GalleryPageActions["browseAction"];
}

export interface BrowseState {
  readonly location: BrowseLocation;
  readonly page: BrowsePageView | null;
  readonly photos: readonly GalleryPhotoView[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
}
