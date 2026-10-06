import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export type SyncGroupResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: "SELECTION_CLOSED" }
  | {
      readonly ok: false;
      readonly code: "SELECTION_IN_USE";
      readonly usage: number;
      readonly unit: string | null;
    };

export interface SyncGroupDeps {
  readonly selections: SelectionRepositoryPort;
}
