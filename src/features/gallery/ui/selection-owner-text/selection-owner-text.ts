import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { formatGalleryShortDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { SelectionCardState } from "@/features/gallery/domain/selection-group-status/selection-group-status.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { SELECTION_OWNER_COPY as COPY } from "./selection-owner.copy";

/** The unit word a group counts in, *foto* when the item names none. @param group - the group @returns the unit */
export const unitOfOwnerGroup = (group: Pick<OwnerGroupView, "unit">): string =>
  group.unit ?? CLIENT_COPY.defaultUnit;

/** The group's status chip: *Terbuka* info, *Dikirim* success, *Dikunci* neutral (owner exports). @param status - the group status @returns the chip props */
export function groupStatusChip(
  status: OwnerGroupView["status"],
): Pick<StatusChipProps, "label" | "tone"> {
  const tones = { OPEN: "info", SUBMITTED: "success", LOCKED: "neutral" } as const;
  return { label: COPY.status[status], tone: tones[status] };
}

/** One group's line on the card and the page: usage, notes and, when sent, the date (owner exports, AC-SEL-010). @param group - the group @param isPage - the page says *dipilih* for open groups @returns the line */
export function groupMeta(group: OwnerGroupView, isPage: boolean): string {
  const unit = unitOfOwnerGroup(group);
  const usage =
    group.status === "OPEN" && isPage
      ? COPY.usageOpen(group.usage, group.limit, unit)
      : COPY.usage(group.usage, group.limit, unit);
  const parts = [usage];
  if (group.noteCount > 0) parts.push(COPY.notes(group.noteCount));
  // An open group the client sent below its limit shows the send too (Owner 2026-10-07).
  if (group.status !== "LOCKED" && group.submittedAt !== null) {
    parts.push(COPY.sentOn(formatGalleryShortDate(group.submittedAt)));
  }
  return parts.join(COPY.metaJoin);
}

/** The card's description line for its state (card export states A–E). @param state - the card state @param submittedCount - groups waiting for review @returns the line */
export function cardDescription(state: SelectionCardState, submittedCount: number): string | null {
  if (state === "NOT_PUBLISHED") return COPY.cardNotPublished;
  if (state === "NO_ITEMS") return null;
  if (state === "OPEN") return COPY.cardOpen;
  if (state === "REVIEW") return COPY.cardReview(submittedCount);
  return COPY.cardFinal;
}
