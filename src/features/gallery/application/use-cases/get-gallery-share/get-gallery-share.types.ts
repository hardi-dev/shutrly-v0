import type { ClientLinkReaderPort } from "../../ports/client-link-reader/client-link-reader.port";
import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type {
  ShareRecipientReaderPort,
  ShareRecipientRecord,
} from "../../ports/share-recipient-reader/share-recipient-reader.port";

export interface GetGalleryShareDeps {
  readonly galleries: GalleryRepositoryPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly links: ClientLinkReaderPort;
  readonly recipients: ShareRecipientReaderPort;
  readonly now: Date;
  /** The app's origin, e.g. "https://shutrly.app" (the client link's base). */
  readonly origin: string;
}

/**
 * What the share dialog may use. The password and the link appear only when the gallery may be
 * shared (BR-GAL-010, AC-GFL-025); a refused share carries nothing else.
 */
export type GalleryShare =
  | { readonly shareable: false }
  | {
      readonly shareable: true;
      readonly projectTitle: string;
      readonly recipient: ShareRecipientRecord;
      readonly password: string;
      readonly link: string;
    };
