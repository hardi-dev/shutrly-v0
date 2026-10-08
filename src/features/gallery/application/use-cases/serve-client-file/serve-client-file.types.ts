import type { ClientGalleryReaderPort } from "../../ports/client-gallery-reader/client-gallery-reader.port";
import type { GallerySourceProviderPort } from "../../ports/gallery-source-provider/gallery-source-provider.port";

export interface ServeClientFileDeps {
  readonly reader: ClientGalleryReaderPort;
  readonly provider: GallerySourceProviderPort;
}

/** A finished file ready to stream as an attachment, or nothing (an empty 404). */
export type ServeClientFileResult =
  | {
      readonly ok: true;
      readonly body: ReadableStream<Uint8Array>;
      readonly contentType: string;
      readonly contentLength: string | null;
      readonly fileName: string;
    }
  | { readonly ok: false };
