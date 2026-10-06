import type { AddOnTargetCheck } from "@/features/gallery/domain/extra-limit/extra-limit.types";

import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export interface CheckAddOnTargetDeps {
  readonly selections: SelectionRepositoryPort;
}

export type CheckAddOnTargetResult = AddOnTargetCheck | "TARGET_OTHER_PROJECT";
