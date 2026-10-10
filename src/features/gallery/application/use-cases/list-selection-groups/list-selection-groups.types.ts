import type {
  OwnerGroupView,
  SelectionCardView,
} from "../owner-selection-views/owner-selection-views.types";

/** The photos shown as a strip on a group's card, up to eight, and how many more there are (owner-1 exports). */
export interface GroupPreview {
  readonly photoIds: readonly string[];
  readonly more: number;
}

export interface OwnerGroupRowView extends OwnerGroupView {
  readonly preview: GroupPreview;
}

/** The *Pilihan klien* page: every group with its photo strip. */
export interface SelectionGroupsView extends Omit<SelectionCardView, "groups"> {
  readonly groups: readonly OwnerGroupRowView[];
}
