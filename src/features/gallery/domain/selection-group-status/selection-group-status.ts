import type {
  CardFacts,
  LockCheck,
  LockFacts,
  LockIntent,
  SelectionCardState,
} from "./selection-group-status.types";

/**
 * The Owner's one action for a group: *Kunci pilihan* for a submitted group or an open one the client
 * has sent below its limit, *Tutup pilihan* for an open group never sent, none once locked
 * (BR-SEL-005, Owner 2026-10-07).
 * @param group - the group's status and when the client last sent it (string or Date)
 * @returns LOCK, CLOSE or null
 */
export function lockIntentFor({ status, submittedAt }: LockFacts): LockIntent | null {
  if (status === "LOCKED") return null;
  if (status === "SUBMITTED" || submittedAt !== null) return "LOCK";
  return "CLOSE";
}

/**
 * Whether the Owner may lock or close a group: the intent must be the group's one action
 * (`lockIntentFor`), and a locked group never changes again (BR-SEL-005, AC-SEL-011).
 * @param group - the group's status and when the client last sent it
 * @param intent - *Kunci pilihan* or *Tutup pilihan*
 * @returns OK or INVALID_STATE
 */
export function lockCheck(group: LockFacts, intent: LockIntent): LockCheck {
  return lockIntentFor(group) === intent ? "OK" : "INVALID_STATE";
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
