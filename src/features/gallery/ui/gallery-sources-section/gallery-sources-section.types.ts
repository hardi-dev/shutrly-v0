import type {
  GalleryPageView,
  GallerySourceView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";
import type { GallerySyncState } from "../use-gallery-sync/use-gallery-sync.types";

export interface GallerySourcesSectionProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly actions: GalleryPageActions;
}

export interface SourcesHeaderActionsProps {
  readonly sync: GallerySyncState;
  readonly page: GalleryPageView;
  readonly onAdd: () => void;
}

export interface SourceListProps {
  readonly sources: readonly GallerySourceView[];
  readonly sync: GallerySyncState;
  readonly isEditable: boolean;
  readonly isArchived: boolean;
}

export interface AddFolderButtonProps {
  readonly onAdd: () => void;
}
