export type PickMode = "COUNT" | "QUANTITY";
export type SelectionGroupStatus = "OPEN" | "SUBMITTED" | "LOCKED";

export interface PickChange {
  readonly mode: PickMode;
  /** Effective limit. */
  readonly limit: number;
  /** Current usage, this pick included. */
  readonly usage: number;
  /** 0 when not picked. */
  readonly currentQuantity: number;
  /** 0 to un-pick. */
  readonly nextQuantity: number;
}

export type PickCheck = "OK" | "LIMIT_REACHED" | "INVALID_QUANTITY";
