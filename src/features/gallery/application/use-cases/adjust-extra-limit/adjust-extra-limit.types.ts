import type { ExtraLimitChange } from "@/features/gallery/domain/extra-limit/extra-limit.types";

import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export interface AdjustExtraLimitDeps {
  readonly selections: SelectionRepositoryPort;
}

/** An approved (positive) or cancelled (negative) add-on quantity for one group. */
export interface ExtraLimitDelta {
  readonly groupId: string;
  readonly delta: number;
}

type ExtraLimitRefusal = Exclude<ExtraLimitChange, { readonly ok: true }>;

export type AdjustExtraLimitResult =
  | { readonly ok: true }
  | ExtraLimitRefusal
  | { readonly ok: false; readonly code: "TARGET_OTHER_PROJECT" };
