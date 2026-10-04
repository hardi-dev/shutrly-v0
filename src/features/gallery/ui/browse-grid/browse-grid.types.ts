import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { BrowseState } from "../use-gallery-browse/use-gallery-browse.types";

export interface BrowseGridProps {
  readonly workspaceId: string;
  readonly state: BrowseState;
  readonly onOpenFolder: (folder: FolderTileView) => void;
  readonly onOpenPhoto: (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => void;
  readonly onLoadMore: () => void;
}

export interface BrowseFolderItemProps {
  readonly folder: FolderTileView;
  readonly onOpenFolder: BrowseGridProps["onOpenFolder"];
}

export interface BrowsePhotoItemProps {
  readonly workspaceId: string;
  readonly photo: GalleryPhotoView;
  readonly list: readonly GalleryPhotoView[];
  readonly isSearch: boolean;
  readonly onOpenPhoto: BrowseGridProps["onOpenPhoto"];
}
