import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";

import { DELIVERY_COPY } from "../delivery-copy/delivery.copy";
import { SELECTION_OWNER_COPY } from "../selection-owner-text/selection-owner.copy";
import { groupStatusChip } from "../selection-owner-text/selection-owner-text";
import { GALLERY_SUMMARY_COPY as COPY } from "./gallery-summary.copy";
import type { GallerySummaryRow } from "./gallery-summary-text.types";

function selectionState(card: SelectionCardView, isMobile: boolean) {
  const sent = card.groups.filter((group) => group.status === "SUBMITTED").length;
  if (card.state === "FINAL") {
    return { tail: isMobile ? COPY.allLockedMobile : COPY.allLocked, status: "LOCKED" as const };
  }
  if (card.state === "REVIEW") {
    return {
      tail: isMobile ? COPY.sentMobile(sent) : COPY.sent(sent),
      status: "SUBMITTED" as const,
    };
  }
  return { tail: isMobile ? COPY.openMobile : COPY.open, status: "OPEN" as const };
}

/**
 * The Galeri card's *Pilihan klien* row: each group's usage and the state on desktop, the state alone
 * on phones, with the group status chip; the card note while the gallery is unpublished (Owner 7, A-34).
 * @param card - the *Pilihan klien* card view
 * @param isMobile - phones show the short line
 * @returns the row, or null when the package has no selection item
 */
export function selectionSummary(
  card: SelectionCardView,
  isMobile: boolean,
): GallerySummaryRow | null {
  const title = SELECTION_OWNER_COPY.cardTitle;
  if (card.state === "NO_ITEMS") return null;
  if (card.state === "NOT_PUBLISHED") {
    return { title, meta: SELECTION_OWNER_COPY.cardNotPublishedNote, chip: null };
  }
  const { tail, status } = selectionState(card, isMobile);
  const usages = card.groups.map((group) => COPY.groupUsage(group.name, group.usage, group.limit));
  const meta = isMobile ? tail : [...usages, tail].join(COPY.join);
  return { title, meta, chip: groupStatusChip(status) };
}

// F-20: one part per package item with files, "3 Foto edit · 1 Foto cetak".
function finishedKinds(card: DeliveryCardView): string {
  return card.items
    .filter((item) => item.count > 0)
    .map((item) => COPY.item(item.count, item.name))
    .join(COPY.join);
}

/**
 * The Galeri card's *Hasil akhir* row: ready files or the publication date (with the kinds on
 * desktop) and its chip; the refusal reason while nothing can be published (Owner 7, A-34).
 * @param card - the *Hasil akhir* card view
 * @param isMobile - phones leave out the kinds
 * @returns the row, or null where final delivery never applies
 */
export function deliverySummary(
  card: DeliveryCardView,
  isMobile: boolean,
): GallerySummaryRow | null {
  const title = DELIVERY_COPY.cardTitle;
  if (!card.isShown) return null;
  if (card.state === "NO_FILES" || card.state === "GALLERY_INACTIVE") {
    const reason = card.state === "NO_FILES" ? "NO_FINISHED_FILE" : "GALLERY_NOT_PUBLISHED";
    return { title, meta: DELIVERY_COPY.reason[reason], chip: null };
  }
  if (card.state === "READY") {
    const meta = isMobile ? COPY.readyMobile : COPY.ready(finishedKinds(card));
    return { title, meta, chip: { label: DELIVERY_COPY.chip.READY, tone: "info" } };
  }
  const published = COPY.published(card.publishedAt ? formatGalleryDate(card.publishedAt) : "");
  const meta = isMobile ? published : [published, finishedKinds(card)].join(COPY.join);
  return { title, meta, chip: { label: DELIVERY_COPY.chip.PUBLISHED, tone: "success" } };
}
