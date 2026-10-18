import type { GalleryProjectStatus } from "../gallery-state/gallery-state.types";

/** Why final delivery can't be published (BR-DEL-003, A-17, AC-DEL-002). */
export type FinalDeliveryReason = "NO_FINISHED_FILE" | "PROJECT_STATUS";

/** The gallery side of BR-DEL-003, read under the gallery lock. */
export interface GalleryDeliveryFacts {
  /** Visible, not-missing EDITED and PRINT photos. */
  readonly finishedCount: number;
}

/** The *Hasil akhir* card states (F-27 P4, P7): no file, ready, delivered, or project completed. */
export type DeliveryCardState = "NO_FILES" | "READY" | "DELIVERED" | "COMPLETED";

export interface DeliveryCardFacts extends GalleryDeliveryFacts {
  /** True once *Tandai terkirim* has recorded the delivery (BR-DEL-003). */
  readonly published: boolean;
  readonly projectStatus: GalleryProjectStatus;
}
