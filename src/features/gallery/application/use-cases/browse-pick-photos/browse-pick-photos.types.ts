import type {
  BrowseCursor,
  GalleryBrowseReaderPort,
} from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type { ClientPhotoView } from "../client-views/client-views.types";

/** One page of Pilih's flat photo grid: every visible proof, in file-name order (pilih exports). */
export interface PickPhotosPage {
  readonly total: number;
  readonly photos: readonly ClientPhotoView[];
  readonly nextCursor: BrowseCursor | null;
}

export interface PickPhotosDeps {
  /** The client mode of the browse reader (missing photos hidden, proofs only). */
  readonly browse: GalleryBrowseReaderPort;
  readonly directImages: boolean;
}
