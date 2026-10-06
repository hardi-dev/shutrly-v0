import type { AccessCardState } from "@/features/gallery/domain/access-card/access-card.types";

import type { ClientLinkReaderPort } from "../../ports/client-link-reader/client-link-reader.port";
import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { GallerySummaryView } from "../gallery-views/gallery-views.types";

export interface GetAccessCardDeps {
  readonly galleries: GalleryRepositoryPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly links: ClientLinkReaderPort;
  readonly now: Date;
  /** The app's origin, e.g. "https://shutrly.app" (the client link's base). */
  readonly origin: string;
}

/** The project page's *Akses klien* card; Owner-only, the full link stays on the Owner's page (C-103). */
export interface AccessCardView {
  readonly state: AccessCardState;
  readonly projectId: string;
  readonly gallery: GallerySummaryView;
  /** The full link, copied by *Salin*. */
  readonly link: string;
  readonly maskedLink: string;
}
