import type { SelectionGroupDetailView } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail.types";
import { formatGalleryDateAndTime } from "@/features/gallery/domain/gallery-display/gallery-display";

import { SELECTION_OWNER_COPY as COPY } from "../selection-owner-text/selection-owner.copy";

/** The *Waktu* fact of the summary: when it was sent or locked, or when an open group last changed (owner-2 exports). @param detail - the group detail @returns the line */
export function timeFact({ group, changedAt }: SelectionGroupDetailView): string {
  if (group.status === "LOCKED" && group.lockedAt !== null) {
    return COPY.timeLocked(formatGalleryDateAndTime(group.lockedAt));
  }
  if (group.status === "SUBMITTED" && group.submittedAt !== null) {
    return COPY.timeSent(formatGalleryDateAndTime(group.submittedAt));
  }
  return changedAt === null ? COPY.timeNone : COPY.timeChanged(formatGalleryDateAndTime(changedAt));
}

/** The *Foto pilihan* card's description: photos and notes, or for print groups the hint that quantities sit on each photo (owner-2 exports). @param detail - the group detail @returns the line */
export function picksMeta({ group, picks }: SelectionGroupDetailView): string {
  return group.mode === "QUANTITY"
    ? COPY.picksMetaQuantity(picks.length)
    : COPY.picksMetaCount(picks.length, group.noteCount);
}
