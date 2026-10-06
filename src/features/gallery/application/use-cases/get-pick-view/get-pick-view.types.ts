import type {
  PickMode,
  SelectionGroupStatus,
} from "@/features/gallery/domain/selection-usage/selection-usage.types";

import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";
import type { ClientPhotoView } from "../client-views/client-views.types";

/** The group a Pilih screen picks for, with its effective limit (BR-SEL-002). */
export interface PickGroupView {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly mode: PickMode;
  readonly allowsPickNotes: boolean;
  readonly limit: number;
  readonly usage: number;
  readonly status: SelectionGroupStatus;
}

/** A pick of this group, missing photos included so they can be un-picked (A-8). */
export interface PickedPhotoView {
  readonly photo: ClientPhotoView;
  readonly quantity: number;
  readonly note: string | null;
}

/** A pick in another group, shown as a marker on the tile (A-25). */
export interface OtherGroupPick {
  readonly photoId: string;
  readonly groupName: string;
  readonly mode: PickMode;
  readonly quantity: number;
}

export interface PickView {
  readonly group: PickGroupView;
  readonly picks: readonly PickedPhotoView[];
  readonly otherPicks: readonly OtherGroupPick[];
}

export type PickViewResult =
  | { readonly kind: "VIEW"; readonly view: PickView }
  | { readonly kind: "NOT_OPEN" }
  | { readonly kind: "NOT_FOUND" };

export interface PickViewDeps {
  readonly selections: SelectionRepositoryPort;
  readonly directImages: boolean;
}
