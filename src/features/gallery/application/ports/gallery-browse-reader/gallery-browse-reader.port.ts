import "server-only";

import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { GalleryPhotoRecord } from "../gallery-repository/gallery-repository.port";

export interface BrowseCursor {
  readonly sortKey: string;
  readonly id: string;
}

export interface KindTotals {
  readonly proof: number;
  readonly edited: number;
  readonly print: number;
}

export interface SourceFolderRecord {
  readonly sourceId: string;
  readonly name: string | null;
  readonly count: number;
}

export interface ChildFolderRecord {
  readonly name: string;
  readonly count: number;
}

export interface FolderScope {
  readonly galleryId: string;
  readonly kind: PhotoKind;
  readonly sourceId: string;
  /** The folded browse path, `""` at the source root. */
  readonly path: string;
}

export interface PhotoPage {
  readonly photos: readonly GalleryPhotoRecord[];
  readonly nextCursor: BrowseCursor | null;
}

export interface SearchPage extends PhotoPage {
  readonly total: number;
}

// D-12: every read is scoped by workspace and gallery, and hides removed sources.
export interface GalleryBrowseReaderPort {
  readonly galleryExists: (context: WorkspaceContext, galleryId: string) => Promise<boolean>;
  readonly kindTotals: (context: WorkspaceContext, galleryId: string) => Promise<KindTotals>;
  readonly sourceFolders: (
    context: WorkspaceContext,
    galleryId: string,
    kind: PhotoKind,
  ) => Promise<readonly SourceFolderRecord[]>;
  readonly activeSources: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly SourceFolderRecord[]>;
  readonly childFolders: (
    context: WorkspaceContext,
    scope: FolderScope,
  ) => Promise<readonly ChildFolderRecord[]>;
  readonly folderTotal: (context: WorkspaceContext, scope: FolderScope) => Promise<number>;
  readonly folderPhotos: (
    context: WorkspaceContext,
    scope: FolderScope,
    cursor: BrowseCursor | null,
    limit: number,
  ) => Promise<PhotoPage>;
  readonly searchPhotos: (
    context: WorkspaceContext,
    galleryId: string,
    text: string,
    cursor: BrowseCursor | null,
    limit: number,
  ) => Promise<SearchPage>;
}
