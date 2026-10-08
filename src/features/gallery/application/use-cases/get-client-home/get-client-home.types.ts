import type {
  ClientLanding,
  HomeGreeting,
  HomeGroupCard,
} from "@/features/gallery/domain/client-home/client-home.types";

import type { GalleryBrowseReaderPort } from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export interface ClientHomeGroupView extends HomeGroupCard {
  readonly unit: string | null;
}

/** Beranda: landing, greeting, the *Foto Anda* counts and one card per group (A-24, A-31). */
export interface ClientHomeView {
  readonly landing: ClientLanding;
  readonly greeting: HomeGreeting;
  readonly finalDeliveryPublished: boolean;
  readonly proofCount: number;
  readonly editedCount: number;
  readonly printCount: number;
  readonly groups: readonly ClientHomeGroupView[];
}

export interface ClientHomeDeps {
  readonly selections: SelectionRepositoryPort;
  /** The client mode of the browse reader (missing photos hidden). */
  readonly browse: GalleryBrowseReaderPort;
}
