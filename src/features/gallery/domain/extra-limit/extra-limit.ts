import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";
import type { AddOnTargetCheck, ExtraLimitChange, ExtraLimitFacts } from "./extra-limit.types";

/** Whether an add-on may target a group: `OPEN` or `SUBMITTED`, never `LOCKED` (BR-ADD-002, A-10). @param status - the group's stored status @returns OK or TARGET_LOCKED */
export function addOnTargetCheck(status: SelectionGroupStatus): AddOnTargetCheck {
  return status === "LOCKED" ? "TARGET_LOCKED" : "OK";
}

/**
 * Applies an approved (positive) or cancelled (negative) add-on quantity to a locked group:
 * approval refuses a `LOCKED` group and reopens a `SUBMITTED` one (BR-ADD-004, BR-SEL-005); a
 * cancel never changes the status and is refused when the limit would drop below usage
 * (BR-ADD-005, A-22).
 * @param group - the locked group's status, limits and usage
 * @param delta - the signed add-on quantity
 * @returns the new extra limit and whether to reopen, or the refusal
 * @throws Error when extra_limit would go negative: it must equal the sum of approved add-ons
 */
export function extraLimitChange(group: ExtraLimitFacts, delta: number): ExtraLimitChange {
  const extraLimit = group.extraLimit + delta;
  if (extraLimit < 0) throw new Error("extra_limit would drop below zero (BR-SEL-002).");
  if (delta > 0) {
    if (addOnTargetCheck(group.status) === "TARGET_LOCKED") {
      return { ok: false, code: "TARGET_LOCKED" };
    }
    return { ok: true, extraLimit, reopen: group.status === "SUBMITTED" };
  }
  const limit = group.baseLimit + extraLimit;
  if (limit < group.usage) {
    return { ok: false, code: "CANCEL_BELOW_USAGE", usage: group.usage, limit };
  }
  return { ok: true, extraLimit, reopen: false };
}
