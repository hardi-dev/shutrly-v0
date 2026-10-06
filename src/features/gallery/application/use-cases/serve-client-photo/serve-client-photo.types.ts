import type { ClientGalleryReaderPort } from "../../ports/client-gallery-reader/client-gallery-reader.port";
import type { GallerySourceProviderPort } from "../../ports/gallery-source-provider/gallery-source-provider.port";

export interface ServeClientPhotoDeps {
  readonly reader: ClientGalleryReaderPort;
  readonly provider: GallerySourceProviderPort;
}
