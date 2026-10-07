import type {
  PickChange,
  PickCheck,
  PickMode,
  SubmitCheck,
  SubmitFacts,
} from "./selection-usage.types";

/** BR-SEL-002: never stored. @param base - item value @param extra - approved add-ons @returns the effective limit */
// F-19: the most photos one *Pilih untuk…* on a selection sends at once.
export const BULK_PICK_MAX = 500;

export const effectiveLimit = (base: number, extra: number): number => base + extra;

/**
 * Usage after a pick changes from `currentQuantity` to `nextQuantity` (BR-SEL-003, A-9).
 * @param change - mode, effective limit, current usage and the two quantities
 * @returns OK, LIMIT_REACHED when the new usage would pass the limit, INVALID_QUANTITY otherwise
 */
export function checkPickChange(change: PickChange): PickCheck {
  const { mode, limit, usage, currentQuantity, nextQuantity } = change;
  if (!Number.isInteger(nextQuantity) || nextQuantity < 0) return "INVALID_QUANTITY";
  if (mode === "COUNT" && nextQuantity > 1) return "INVALID_QUANTITY";
  const nextUsage = usage - currentQuantity + nextQuantity;
  // Lowering or removing a pick is always allowed, even when usage is above the limit (A-8).
  if (nextQuantity <= currentQuantity) return "OK";
  return nextUsage <= limit ? "OK" : "LIMIT_REACHED";
}

/** Usage of a group from its picks (BR-SEL-003). @param mode - pick mode @param quantities - quantities of the group's picks @returns usage */
export function usageOf(mode: PickMode, quantities: readonly number[]): number {
  return mode === "COUNT" ? quantities.length : quantities.reduce((sum, q) => sum + q, 0);
}

/** Places a group has left (BR-SEL-003). @param limit - effective limit @param usage - usage @returns places left, never negative */
export const remainingPlaces = (limit: number, usage: number): number => Math.max(0, limit - usage);

/** Whether a group may be submitted: it is `OPEN` and holds at least one pick (BR-SEL-005, A-5). @param facts - status and number of picks @returns OK, NOT_OPEN or NO_PICKS */
export function canSubmit({ status, pickCount }: SubmitFacts): SubmitCheck {
  if (status !== "OPEN") return "NOT_OPEN";
  return pickCount > 0 ? "OK" : "NO_PICKS";
}
