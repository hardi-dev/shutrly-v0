import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { formatGalleryShortDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { SelectionCardState } from "@/features/gallery/domain/selection-group-status/selection-group-status.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import type { SelectionOwnerTranslate } from "./selection-owner-text.types";

const META_JOIN = " · ";

/** The unit word a group counts in: the item's own name, or the translated *photos* when it names none. @param t - the translator @param group - the group @returns the unit */
export const unitOfOwnerGroup = (
  t: SelectionOwnerTranslate,
  group: Pick<OwnerGroupView, "unit">,
): string => group.unit ?? t("defaultUnit");

const STATUS_KEY = {
  OPEN: "statusOpen",
  SUBMITTED: "statusSubmitted",
  LOCKED: "statusLocked",
} as const;

/** The group's status chip: *Terbuka* info, *Dikirim* success, *Dikunci* neutral (owner exports). @param t - the translator @param status - the group status @returns the chip props */
export function groupStatusChip(
  t: SelectionOwnerTranslate,
  status: OwnerGroupView["status"],
): Pick<StatusChipProps, "label" | "tone"> {
  const tones = { OPEN: "info", SUBMITTED: "success", LOCKED: "neutral" } as const;
  return { label: t(STATUS_KEY[status]), tone: tones[status] };
}

/** One group's usage line: the allowance, the selected count while open on the page, and the note count. @param t - the translator @param group - the group @param isPage - the page says *dipilih* for open groups @returns the usage text */
function usageLine(t: SelectionOwnerTranslate, group: OwnerGroupView, isPage: boolean): string {
  const unit = unitOfOwnerGroup(t, group);
  const values = { usage: group.usage, limit: group.limit, unit };
  return group.status === "OPEN" && isPage ? t("usageOpen", values) : t("usage", values);
}

/** One group's line on the card and the page: usage, notes and, when sent, the date (owner exports, AC-SEL-010). @param t - the translator @param group - the group @param isPage - the page says *dipilih* for open groups @param locale - the formatting locale @returns the line */
export function groupMeta(
  t: SelectionOwnerTranslate,
  group: OwnerGroupView,
  isPage: boolean,
  locale: FormattingLocale,
): string {
  const parts = [usageLine(t, group, isPage)];
  if (group.noteCount > 0) parts.push(t("notes", { count: group.noteCount }));
  // An open group the client sent below its limit shows the send too (Owner 2026-10-07).
  if (group.status !== "LOCKED" && group.submittedAt !== null) {
    const date = formatGalleryShortDate(group.submittedAt, locale);
    parts.push(t("sentOn", { date }));
  }
  return parts.join(META_JOIN);
}

/** The card's description line for its state (card export states A–E). @param t - the translator @param state - the card state @param submittedCount - groups waiting for review @returns the line */
export function cardDescription(
  t: SelectionOwnerTranslate,
  state: SelectionCardState,
  submittedCount: number,
): string | null {
  if (state === "NOT_PUBLISHED") return t("cardNotPublished");
  if (state === "NO_ITEMS") return null;
  if (state === "OPEN") return t("cardOpen");
  if (state === "REVIEW") return t("cardReview", { count: submittedCount });
  return t("cardFinal");
}
