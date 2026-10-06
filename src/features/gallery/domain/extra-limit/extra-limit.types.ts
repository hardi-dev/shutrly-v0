import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";

/** The locked group's facts an add-on change needs (BR-SEL-002, BR-ADD-004/005). */
export interface ExtraLimitFacts {
  readonly status: SelectionGroupStatus;
  readonly baseLimit: number;
  readonly extraLimit: number;
  readonly usage: number;
}

export type AddOnTargetCheck = "OK" | "TARGET_LOCKED";

/** The new `extra_limit` and whether a submitted group returns to `OPEN`, or why not. */
export type ExtraLimitChange =
  | { readonly ok: true; readonly extraLimit: number; readonly reopen: boolean }
  | { readonly ok: false; readonly code: "TARGET_LOCKED" }
  | {
      readonly ok: false;
      readonly code: "CANCEL_BELOW_USAGE";
      readonly usage: number;
      /** The effective limit the cancel would have left. */
      readonly limit: number;
    };
