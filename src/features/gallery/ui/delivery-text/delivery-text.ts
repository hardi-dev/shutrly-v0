import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import {
  formatGalleryDate,
  formatGalleryDateAndTime,
  formatGalleryShortDate,
} from "@/features/gallery/domain/gallery-display/gallery-display";

import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";
import type { DeliveryRow } from "./delivery-text.types";

const READY_CHIP = { label: COPY.chip.READY, tone: "info" } as const;

/** "24 foto Edited dan 6 file Print", leaving out a kind with no file. @param card - the card view @returns the phrase */
export function finishedFiles(card: Pick<DeliveryCardView, "editedCount" | "printCount">): string {
  const parts: string[] = [];
  if (card.editedCount > 0) parts.push(COPY.editedFiles(card.editedCount));
  if (card.printCount > 0) parts.push(COPY.printFiles(card.printCount));
  return parts.join(COPY.and);
}

function readyRows(card: DeliveryCardView): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  if (card.editedCount > 0) {
    rows.push({
      key: "edited",
      title: COPY.edited,
      meta: COPY.editedCount(card.editedCount),
      chip: READY_CHIP,
    });
  }
  if (card.printCount > 0) {
    rows.push({
      key: "print",
      title: COPY.print,
      meta: COPY.printCount(card.printCount),
      chip: READY_CHIP,
    });
  }
  return rows;
}

/**
 * The card's rows for its state: one per finished kind when ready, the publication when published,
 * the completion when completed; none for states A and E, which show a note (hasilakhirowner-kartu).
 * @param card - the card view
 * @returns the rows
 */
export function deliveryRows(card: DeliveryCardView): readonly DeliveryRow[] {
  if (card.state === "READY") return readyRows(card);
  if (card.state === "PUBLISHED" && card.publishedAt) {
    return [
      {
        key: "published",
        title: COPY.publishedTitle(formatGalleryDateAndTime(card.publishedAt)),
        meta: COPY.publishedMeta(finishedFiles(card)),
        chip: { label: COPY.chip.PUBLISHED, tone: "success" },
      },
    ];
  }
  if (card.state === "COMPLETED" && card.completedAt) {
    return [
      {
        key: "completed",
        title: COPY.completedTitle(formatGalleryShortDate(card.completedAt)),
        meta: COPY.completedMeta,
        chip: { label: COPY.chip.COMPLETED, tone: "neutral" },
      },
    ];
  }
  return [];
}

/** The note of states A and E, or null. @param card - the card view @returns the note */
export function deliveryNote(card: DeliveryCardView): string | null {
  if (card.state === "NO_FILES") return COPY.noFilesNote;
  return card.state === "GALLERY_INACTIVE" ? COPY.inactiveNote : null;
}

/** The header meta of a delivered project, *Hasil akhir dipublikasikan {date}*, or null in any other state (owner-7 `r71J5`). @param card - the card view @returns the meta */
export function deliveredHeaderMeta(card: DeliveryCardView): string | null {
  if (card.state !== "PUBLISHED" || card.publishedAt === null) return null;
  return COPY.headerMeta(formatGalleryDate(card.publishedAt));
}
