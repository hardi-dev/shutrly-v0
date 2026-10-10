import type { GalleryProjectStatus, GalleryStatus } from "../gallery-status/gallery-status.types";

/** Why final delivery can't be published (BR-DEL-003, A-17, AC-DEL-002). */
export type FinalDeliveryReason = "NO_FINISHED_FILE" | "GALLERY_NOT_PUBLISHED" | "PROJECT_STATUS";

/** The gallery side of BR-DEL-003 / A-17, read under the gallery lock. */
export interface GalleryDeliveryFacts {
  /** Effective status, or null when the project has no gallery. */
  readonly status: GalleryStatus | null;
  /** Visible, not-missing EDITED and PRINT photos. */
  readonly finishedCount: number;
}

/** The *Hasil akhir* card states A–E (hasilakhirowner-kartu). */
export type DeliveryCardState =
  "NO_FILES" | "READY" | "PUBLISHED" | "COMPLETED" | "GALLERY_INACTIVE";

export interface DeliveryCardFacts extends GalleryDeliveryFacts {
  readonly published: boolean;
  readonly projectStatus: GalleryProjectStatus;
}
