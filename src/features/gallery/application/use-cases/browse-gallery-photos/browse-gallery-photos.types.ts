import type {
  BrowseCursor,
  KindTotals,
} from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type { GalleryPhotoView } from "../gallery-views/gallery-views.types";

export interface FolderTileView {
  readonly name: string;
  readonly count: number;
  readonly sourceId: string;
  /** The folded browse path this tile opens; `""` for a source's root. */
  readonly path: string;
}

export interface FolderSummary {
  readonly folderCount: number;
  readonly photoCount: number;
}

export interface BrowsePageView {
  readonly mode: "SOURCES" | "FOLDER" | "SEARCH";
  readonly totals: KindTotals;
  /** The opened source, or the only source when the gallery has one (AC-GAL-028). */
  readonly sourceId: string | null;
  readonly isSingleSource: boolean;
  readonly folders: readonly FolderTileView[];
  readonly summary: FolderSummary | null;
  readonly photos: readonly GalleryPhotoView[];
  readonly nextCursor: BrowseCursor | null;
}

export interface SearchQuery {
  readonly search: string;
  readonly cursor: BrowseCursor | null;
}
