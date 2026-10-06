import type { BrowseCursor } from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type { GalleryBrowseReaderPort } from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type {
  FolderSummary,
  FolderTileView,
} from "../browse-gallery-photos/browse-gallery-photos.types";
import type { ClientPhotoView } from "../client-views/client-views.types";

/** One page of *Semua foto* for a client: proofs only, client photo views (D-15). */
export interface ClientBrowsePageView {
  readonly mode: "SOURCES" | "FOLDER" | "SEARCH";
  readonly proofTotal: number;
  /** Visible finished files, 0 until final delivery is published (BR-DEL-002). */
  readonly editedTotal: number;
  readonly printTotal: number;
  readonly sourceId: string | null;
  readonly isSingleSource: boolean;
  readonly folders: readonly FolderTileView[];
  readonly summary: FolderSummary | null;
  readonly photos: readonly ClientPhotoView[];
  readonly nextCursor: BrowseCursor | null;
}

export interface ClientBrowseDeps {
  /** The client mode of the browse reader. */
  readonly browse: GalleryBrowseReaderPort;
  readonly directImages: boolean;
}
