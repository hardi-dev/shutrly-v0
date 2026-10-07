import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";

/** *Kunci pilihan* locks a submitted group, *Tutup pilihan* closes an open one (D-13, BR-SEL-005). */
export type LockIntent = "LOCK" | "CLOSE";

export type LockCheck = "OK" | "INVALID_STATE";

/** What decides the Owner's action on a group: its status and the client's last send, if any. */
export interface LockFacts {
  readonly status: SelectionGroupStatus;
  readonly submittedAt: Date | string | null;
}

/** What the Owner's *Pilihan klien* card shows (card export states A–E). */
export type SelectionCardState = "NO_ITEMS" | "NOT_PUBLISHED" | "OPEN" | "REVIEW" | "FINAL";

export interface CardFacts {
  /** Selection items in the project's package (BR-SEL-001). */
  readonly itemCount: number;
  readonly statuses: readonly SelectionGroupStatus[];
}
