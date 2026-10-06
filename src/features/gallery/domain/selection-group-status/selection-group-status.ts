import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";
import type {
  CardFacts,
  LockCheck,
  LockIntent,
  SelectionCardState,
} from "./selection-group-status.types";

/**
 * Whether the Owner may lock or close a group: `LOCK` needs `SUBMITTED`, `CLOSE` needs `OPEN`, and a
 * locked group never changes again (BR-SEL-005, AC-SEL-011).
 * @param status - the group's stored status
 * @param intent - *Kunci pilihan* or *Tutup pilihan*
 * @returns OK or INVALID_STATE
 */
export function lockCheck(status: SelectionGroupStatus, intent: LockIntent): LockCheck {
  const required: SelectionGroupStatus = intent === "LOCK" ? "SUBMITTED" : "OPEN";
  return status === required ? "OK" : "INVALID_STATE";
}

/**
 * The state of the Owner's *Pilihan klien* card: no selection item, groups not created yet (the
 * gallery isn't published), something to review, everything locked, or still open (A-34).
 * @param facts - selection item count and the groups' statuses
 * @returns the card state
 */
export function selectionCardState({ itemCount, statuses }: CardFacts): SelectionCardState {
  if (itemCount === 0) return "NO_ITEMS";
  if (statuses.length === 0) return "NOT_PUBLISHED";
  if (statuses.includes("SUBMITTED")) return "REVIEW";
  return statuses.every((status) => status === "LOCKED") ? "FINAL" : "OPEN";
}
