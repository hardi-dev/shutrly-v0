import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";
import type { PickGroupView } from "../get-pick-view/get-pick-view.types";

/** One of the client's picks, as the viewer's *Pilih untuk…* and *Catatan* need it (A-30, A-32). */
export interface TargetPick {
  readonly groupId: string;
  readonly photoId: string;
  readonly quantity: number;
  readonly note: string | null;
}

/** Every group of the project in Beranda order, with the client's picks (A-30). */
export interface PickTargets {
  readonly groups: readonly PickGroupView[];
  readonly picks: readonly TargetPick[];
}

export interface PickTargetsDeps {
  readonly selections: SelectionRepositoryPort;
}
