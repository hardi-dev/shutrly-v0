import type { ClientGalleryReaderPort } from "../../ports/client-gallery-reader/client-gallery-reader.port";

export interface ListProofDownloadsDeps {
  readonly reader: ClientGalleryReaderPort;
}

/** One proof the client can download: the same-origin URL and the file name (F-19). */
export interface ProofDownloadView {
  readonly id: string;
  readonly fileName: string;
  readonly downloadUrl: string;
}
