import type { SelectionGroupDetailView } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail.types";
import { formatGalleryDateAndTime } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { SelectionOwnerTranslate } from "../selection-owner-text/selection-owner-text.types";

/** The *Waktu* fact of the summary: when it was sent or locked, or when an open group last changed (owner-2 exports). @param t - the translator @param detail - the group detail @param locale - the formatting locale @returns the line */
export function timeFact(
  t: SelectionOwnerTranslate,
  { group, changedAt }: SelectionGroupDetailView,
  locale: FormattingLocale,
): string {
  if (group.status === "LOCKED" && group.lockedAt !== null) {
    return t("timeLocked", { when: formatGalleryDateAndTime(group.lockedAt, locale) });
  }
  if (group.status === "SUBMITTED" && group.submittedAt !== null) {
    return t("timeSent", { when: formatGalleryDateAndTime(group.submittedAt, locale) });
  }
  return changedAt === null
    ? t("timeNone")
    : t("timeChanged", { when: formatGalleryDateAndTime(changedAt, locale) });
}

/** The *Foto pilihan* card's description: photos and notes, or for print groups the hint that quantities sit on each photo (owner-2 exports). @param t - the translator @param detail - the group detail @returns the line */
export function picksMeta(
  t: SelectionOwnerTranslate,
  { group, picks }: SelectionGroupDetailView,
): string {
  if (group.mode === "QUANTITY") return t("picksMetaQuantity", { picks: picks.length });
  if (group.noteCount === 0) return t("picksMetaCount", { picks: picks.length });
  return t("picksMetaCountNotes", { picks: picks.length, withNotes: group.noteCount });
}
