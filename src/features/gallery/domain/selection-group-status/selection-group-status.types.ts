import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";

/** *Kunci pilihan* locks a submitted group, *Tutup pilihan* closes an open one (D-13, BR-SEL-005). */
export type LockIntent = "LOCK" | "CLOSE";

export type LockCheck = "OK" | "INVALID_STATE";

/** What the Owner's *Pilihan klien* card shows (card export states A–E). */
export type SelectionCardState = "NO_ITEMS" | "NOT_PUBLISHED" | "OPEN" | "REVIEW" | "FINAL";

export interface CardFacts {
  /** Selection items in the project's package (BR-SEL-001). */
  readonly itemCount: number;
  readonly statuses: readonly SelectionGroupStatus[];
}
