import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import {
  formatGalleryDate,
  formatGalleryDateAndTime,
  formatGalleryShortDate,
} from "@/features/gallery/domain/gallery-display/gallery-display";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { DeliveryTranslate } from "../delivery-copy/delivery-copy.types";
import type { DeliveryRow } from "./delivery-text.types";

/** "24 file Foto edit dan 6 file Foto cetak", one part per package item with files (F-21). @param t - the translator @param card - the card view @returns the phrase */
export function finishedFiles(t: DeliveryTranslate, card: Pick<DeliveryCardView, "items">): string {
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => t("itemFiles", { count: item.count, name: item.name }))
    .join(t("and"));
}

function readyRows(t: DeliveryTranslate, card: DeliveryCardView): DeliveryRow[] {
  const chip = { label: t("chipReady"), tone: "info" } as const;
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => ({
      key: item.id,
      title: item.name,
      meta: t("itemCount", { count: item.count }),
      chip,
    }));
}

function publishedRows(t: DeliveryTranslate, card: DeliveryCardView, when: string): DeliveryRow[] {
  return [
    {
      key: "published",
      title: t("publishedTitle", { when }),
      meta: t("publishedMeta", { files: finishedFiles(t, card) }),
      chip: { label: t("chipPublished"), tone: "success" },
    },
  ];
}

function completedRows(t: DeliveryTranslate, when: string): DeliveryRow[] {
  return [
    {
      key: "completed",
      title: t("completedTitle", { when }),
      meta: t("completedMeta"),
      chip: { label: t("chipCompleted"), tone: "neutral" },
    },
  ];
}

/**
 * The card's rows for its state: one per package item with files when ready (F-21), the publication when published,
 * the completion when completed; none for states A and E, which show a note (hasilakhirowner-kartu).
 * @param t - the translator
 * @param card - the card view
 * @param locale - the formatting locale
 * @returns the rows
 */
export function deliveryRows(
  t: DeliveryTranslate,
  card: DeliveryCardView,
  locale: FormattingLocale,
): readonly DeliveryRow[] {
  if (card.state === "READY") return readyRows(t, card);
  if (card.state === "PUBLISHED" && card.publishedAt) {
    return publishedRows(t, card, formatGalleryDateAndTime(card.publishedAt, locale));
  }
  if (card.state === "COMPLETED" && card.completedAt) {
    return completedRows(t, formatGalleryShortDate(card.completedAt, locale));
  }
  return [];
}

/** The note of states A and E, or null. @param t - the translator @param card - the card view @returns the note */
export function deliveryNote(t: DeliveryTranslate, card: DeliveryCardView): string | null {
  if (card.state === "NO_FILES") return t("noFilesNote");
  return card.state === "GALLERY_INACTIVE" ? t("inactiveNote") : null;
}

/** The header meta of a delivered project, *Hasil akhir dipublikasikan {date}*, or null in any other state (owner-7 `r71J5`). @param t - the translator @param card - the card view @param locale - the formatting locale @returns the meta */
export function deliveredHeaderMeta(
  t: DeliveryTranslate,
  card: DeliveryCardView,
  locale: FormattingLocale,
): string | null {
  if (card.state !== "PUBLISHED" || card.publishedAt === null) return null;
  return t("headerMeta", { when: formatGalleryDate(card.publishedAt, locale) });
}
