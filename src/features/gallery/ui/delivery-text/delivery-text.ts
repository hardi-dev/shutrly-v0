import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import {
  formatGalleryDate,
  formatGalleryDateAndTime,
  formatGalleryShortDate,
} from "@/features/gallery/domain/gallery-display/gallery-display";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";
import type { DeliveryRow } from "./delivery-text.types";

const READY_CHIP = { label: COPY.chip.READY, tone: "info" } as const;

/** "24 file Foto edit dan 6 file Foto cetak", one part per package item with files (F-21). @param card - the card view @returns the phrase */
export function finishedFiles(card: Pick<DeliveryCardView, "items">): string {
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => COPY.itemFiles(item.count, item.name))
    .join(COPY.and);
}

function readyRows(card: DeliveryCardView): DeliveryRow[] {
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => ({
      key: item.id,
      title: item.name,
      meta: COPY.itemCount(item.count),
      chip: READY_CHIP,
    }));
}

/**
 * The card's rows for its state: one per package item with files when ready (F-21), the publication when published,
 * the completion when completed; none for states A and E, which show a note (hasilakhirowner-kartu).
 * @param card - the card view
 * @returns the rows
 */
export function deliveryRows(
  card: DeliveryCardView,
  locale: FormattingLocale,
): readonly DeliveryRow[] {
  if (card.state === "READY") return readyRows(card);
  if (card.state === "PUBLISHED" && card.publishedAt) {
    return [
      {
        key: "published",
        title: COPY.publishedTitle(formatGalleryDateAndTime(card.publishedAt, locale)),
        meta: COPY.publishedMeta(finishedFiles(card)),
        chip: { label: COPY.chip.PUBLISHED, tone: "success" },
      },
    ];
  }
  if (card.state === "COMPLETED" && card.completedAt) {
    return [
      {
        key: "completed",
        title: COPY.completedTitle(formatGalleryShortDate(card.completedAt, locale)),
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
export function deliveredHeaderMeta(
  card: DeliveryCardView,
  locale: FormattingLocale,
): string | null {
  if (card.state !== "PUBLISHED" || card.publishedAt === null) return null;
  return COPY.headerMeta(formatGalleryDate(card.publishedAt, locale));
}
