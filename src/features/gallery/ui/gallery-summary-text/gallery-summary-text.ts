import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { DeliveryTranslate } from "../delivery-copy/delivery-copy.types";
import { groupStatusChip } from "../selection-owner-text/selection-owner-text";
import type { SelectionOwnerTranslate } from "../selection-owner-text/selection-owner-text.types";
import type { GallerySummaryRow, SummaryTranslate } from "./gallery-summary-text.types";

const JOIN = " · ";

function selectionState(t: SummaryTranslate, card: SelectionCardView, isMobile: boolean) {
  const sent = card.groups.filter((group) => group.status === "SUBMITTED").length;
  if (card.state === "FINAL") {
    return { tail: isMobile ? t("allLockedMobile") : t("allLocked"), status: "LOCKED" as const };
  }
  if (card.state === "REVIEW") {
    return {
      tail: isMobile ? t("sentMobile", { count: sent }) : t("sent", { count: sent }),
      status: "SUBMITTED" as const,
    };
  }
  return { tail: isMobile ? t("openMobile") : t("open"), status: "OPEN" as const };
}

/**
 * The Galeri card's *Pilihan klien* row: each group's usage and the state on desktop, the state alone
 * on phones, with the group status chip; the card note while the gallery is unpublished (Owner 7, A-34).
 * @param t - the summary translator
 * @param selectionT - the selection translator, for the title, the note and the chip
 * @param card - the *Pilihan klien* card view
 * @param isMobile - phones show the short line
 * @returns the row, or null when the package has no selection item
 */
export function selectionSummary(
  t: SummaryTranslate,
  selectionT: SelectionOwnerTranslate,
  card: SelectionCardView,
  isMobile: boolean,
): GallerySummaryRow | null {
  const title = selectionT("cardTitle");
  if (card.state === "NO_ITEMS") return null;
  if (card.state === "NOT_PUBLISHED") {
    return { title, meta: selectionT("cardNotPublishedNote"), chip: null };
  }
  const { tail, status } = selectionState(t, card, isMobile);
  const usages = card.groups.map((group) =>
    t("groupUsage", { name: group.name, usage: group.usage, limit: group.limit }),
  );
  const meta = isMobile ? tail : [...usages, tail].join(JOIN);
  return { title, meta, chip: groupStatusChip(selectionT, status) };
}

// F-21: one part per package item with files, "3 Foto edit · 1 Foto cetak".
function finishedKinds(t: SummaryTranslate, card: DeliveryCardView): string {
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => t("item", { count: item.count, name: item.name }))
    .join(JOIN);
}

/**
 * The Galeri card's *Hasil akhir* row: ready files or the publication date (with the kinds on
 * desktop) and its chip; the refusal reason while nothing can be published (Owner 7, A-34).
 * @param t - the summary translator
 * @param deliveryT - the delivery translator, for the title, the reasons and the chips
 * @param card - the *Hasil akhir* card view
 * @param isMobile - phones leave out the kinds
 * @param locale - the formatting locale
 * @returns the row, or null where final delivery never applies
 */
export function deliverySummary(
  t: SummaryTranslate,
  deliveryT: DeliveryTranslate,
  card: DeliveryCardView,
  isMobile: boolean,
  locale: FormattingLocale,
): GallerySummaryRow | null {
  const title = deliveryT("cardTitle");
  if (!card.isShown) return null;
  if (card.state === "NO_FILES" || card.state === "GALLERY_INACTIVE") {
    const meta =
      card.state === "NO_FILES"
        ? deliveryT("reasonNoFinishedFile")
        : deliveryT("reasonGalleryNotPublished");
    return { title, meta, chip: null };
  }
  if (card.state === "READY") {
    const meta = isMobile ? t("readyMobile") : t("ready", { files: finishedKinds(t, card) });
    return { title, meta, chip: { label: deliveryT("chipReady"), tone: "info" } };
  }
  const when = card.publishedAt ? formatGalleryDate(card.publishedAt, locale) : "";
  const published = t("published", { when });
  const meta = isMobile ? published : [published, finishedKinds(t, card)].join(JOIN);
  return { title, meta, chip: { label: deliveryT("chipPublished"), tone: "success" } };
}
