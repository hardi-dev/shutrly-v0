import type { AddOnRepositoryPort } from "@/features/booking/application/ports/add-on-repository/add-on-repository.port";
import type { SelectionRepositoryPort } from "@/features/gallery/application/ports/selection-repository/selection-repository.port";

export interface AddOnScope {
  readonly addOns: AddOnRepositoryPort;
  readonly selections: SelectionRepositoryPort;
}
