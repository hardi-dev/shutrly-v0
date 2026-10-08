import type { PickMode } from "../selection-usage/selection-usage.types";

export type { PickMode };

/** One pick as the Owner's copyable list needs it (A-6). */
export interface PickListEntry {
  readonly fileName: string;
  readonly quantity: number;
  readonly note: string | null;
}
