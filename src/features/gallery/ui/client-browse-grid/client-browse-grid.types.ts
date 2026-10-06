import type { FolderTileView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";

import type { ClientBrowseState } from "../use-client-browse/use-client-browse.types";

export interface ClientBrowseGridProps {
  readonly state: ClientBrowseState;
  readonly onOpenFolder: (folder: FolderTileView) => void;
  readonly onOpenPhoto: (index: number) => void;
  readonly onLoadMore: () => void;
}

export interface ClientFolderItemProps {
  readonly folder: FolderTileView;
  readonly onOpenFolder: ClientBrowseGridProps["onOpenFolder"];
}

export interface ClientPhotoItemProps {
  readonly photo: ClientPhotoView;
  readonly index: number;
  readonly onOpenPhoto: ClientBrowseGridProps["onOpenPhoto"];
}
