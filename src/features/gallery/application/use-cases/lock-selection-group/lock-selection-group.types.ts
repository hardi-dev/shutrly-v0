import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export interface LockSelectionGroupDeps {
  readonly selections: SelectionRepositoryPort;
  readonly now: Date;
}

export type LockSelectionGroupResult =
  | { readonly ok: true; readonly groupName: string }
  | { readonly ok: false; readonly code: "INVALID" | "INVALID_STATE" };
