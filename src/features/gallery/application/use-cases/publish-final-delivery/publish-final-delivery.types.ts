import type { FinalDeliveryReason } from "@/features/gallery/domain/final-delivery/final-delivery.types";

import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";

export interface PublishFinalDeliveryDeps {
  readonly sources: GallerySourceRepositoryPort;
  readonly now: Date;
}

export type PublishFinalDeliveryResult =
  { readonly ok: true } | { readonly ok: false; readonly reasons: readonly FinalDeliveryReason[] };

/** The publish action's answer: undefined once both the gallery and the project moved, or every reason (AC-DEL-002). */
export type FinalDeliveryWriteResult =
  | undefined
  | {
      readonly ok: false;
      readonly code: "REFUSED";
      readonly reasons: readonly FinalDeliveryReason[];
    };
