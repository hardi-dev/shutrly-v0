import type { SelectionGroupStatus } from "../selection-usage/selection-usage.types";

export interface HomeGroupInput {
  readonly id: string;
  readonly name: string;
  readonly status: SelectionGroupStatus;
  /** Effective limit. */
  readonly limit: number;
  readonly usage: number;
}

export type HomeGroupAction = "START" | "CONTINUE" | "VIEW" | "NONE";

export interface HomeGroupCard extends HomeGroupInput {
  readonly action: HomeGroupAction;
  /** The client's next task gets the primary button (beranda exports). */
  readonly isPrimary: boolean;
  /** 0…1 for the usage bar. */
  readonly progress: number;
}

export type HomeGreeting =
  | { readonly kind: "DELIVERED" }
  | { readonly kind: "START" }
  | { readonly kind: "ALL_SENT" }
  | {
      readonly kind: "PARTLY_SENT";
      readonly sent: readonly string[];
      readonly open: readonly string[];
    };

export type ClientLanding = "HOME" | "ALL_PHOTOS";
