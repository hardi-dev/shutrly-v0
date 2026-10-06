import type { DeliveryCardState } from "@/features/gallery/domain/final-delivery/final-delivery.types";

import type { DeliveryReaderPort } from "../../ports/delivery-reader/delivery-reader.port";

export interface GetDeliveryCardDeps {
  readonly reader: DeliveryReaderPort;
  readonly now: Date;
}

/** The project page's *Hasil akhir* card (hasilakhirowner-kartu states A–E). */
export interface DeliveryCardView {
  readonly state: DeliveryCardState;
  readonly projectTitle: string;
  readonly editedCount: number;
  readonly printCount: number;
  /** ISO instants, null while they don't apply. */
  readonly publishedAt: string | null;
  readonly completedAt: string | null;
  /** *Tandai selesai* is offered only on a DELIVERED project (AC-DEL-007). */
  readonly canComplete: boolean;
}
