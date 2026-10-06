import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";
import type { PickedPhotoView, PickGroupView } from "../get-pick-view/get-pick-view.types";

/** Tinjau (group `OPEN`) or the read-only *Lihat pilihan* (submitted or locked) for one group (A-29). */
export interface ReviewView {
  readonly group: PickGroupView;
  /** This group's picks in file-name order, missing photos included (A-8). */
  readonly picks: readonly PickedPhotoView[];
  /** Places left in the group, never negative (BR-SEL-003). */
  readonly remaining: number;
  /** `OPEN`: picks can change and the group can be sent. */
  readonly isEditable: boolean;
}

export type ReviewResult =
  { readonly kind: "VIEW"; readonly view: ReviewView } | { readonly kind: "NOT_FOUND" };

export interface ReviewDeps {
  readonly selections: SelectionRepositoryPort;
  readonly directImages: boolean;
}
