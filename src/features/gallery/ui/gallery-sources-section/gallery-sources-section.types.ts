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
  /** A folder linked in *Buat galeri*, synced once on open (Revision OT #3). */
  readonly initialSyncSourceId?: string;
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
  /** The last active folder of a published or expired gallery can't be deleted. */
  readonly isLastLocked: boolean;
  readonly onDelete: (source: GallerySourceView) => void;
  readonly onRename: (source: GallerySourceView) => void;
}

export interface AddFolderButtonProps {
  readonly onAdd: () => void;
}

export interface SourceDialogsProps extends GallerySourcesSectionProps {
  readonly isLinking: boolean;
  readonly deleting: GallerySourceView | null;
  readonly renaming: GallerySourceView | null;
  readonly onLinkingChange: (isOpen: boolean) => void;
  readonly onLinked: (sourceId: string) => void;
  readonly onCloseDelete: () => void;
  readonly onCloseRename: () => void;
}
