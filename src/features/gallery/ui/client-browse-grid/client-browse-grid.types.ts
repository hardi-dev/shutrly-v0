import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";

import type { ClientBrowseState } from "../use-client-browse/use-client-browse.types";

/** Select mode and per-tile downloads on *Semua foto* (F-19). */
export interface GridDownloads {
  readonly isSelecting: boolean;
  readonly isSelected: (photoId: string) => boolean;
  readonly toggle: (photo: ClientPhotoView, isSelected: boolean) => void;
  readonly downloadUrlOf: (photoId: string) => string;
}

export interface ClientBrowseGridProps {
  readonly state: ClientBrowseState;
  readonly onOpenFolder: (folder: FolderTileView) => void;
  readonly onOpenPhoto: (index: number) => void;
  readonly onLoadMore: () => void;
  readonly downloads?: GridDownloads;
}

export interface ClientFolderItemProps {
  readonly folder: FolderTileView;
  readonly onOpenFolder: ClientBrowseGridProps["onOpenFolder"];
}

export interface ClientPhotoItemProps {
  readonly photo: ClientPhotoView;
  readonly index: number;
  readonly onOpenPhoto: ClientBrowseGridProps["onOpenPhoto"];
  readonly downloads?: GridDownloads;
}
