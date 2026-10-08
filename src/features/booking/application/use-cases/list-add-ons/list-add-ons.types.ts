import type {
  AddOnRecord,
  AddOnRepositoryPort,
} from "../../ports/add-on-repository/add-on-repository.port";
import type {
  AddOnGroupFacts,
  AddOnTargetPort,
} from "../../ports/add-on-target/add-on-target.port";

export interface ListAddOnsDeps {
  readonly addOns: AddOnRepositoryPort;
  readonly targets: AddOnTargetPort;
}

export interface AddOnRowView extends AddOnRecord {
  /** The target group now, or null for an add-on without a target. */
  readonly group: AddOnGroupFacts | null;
}

/** The project page's *Add-on* card (addon-kartu states A–C). */
export interface AddOnCardView {
  /** False outside BOOKED…DELIVERED (A-11): *Tambah add-on* is hidden. */
  readonly canCreate: boolean;
  readonly addOns: readonly AddOnRowView[];
  /** Groups a new add-on may target (A-10). */
  readonly targets: readonly AddOnGroupFacts[];
  /** Locked groups, for the state C note. */
  readonly lockedGroupNames: readonly string[];
}
