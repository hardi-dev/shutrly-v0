import type {
  OwnerGroupRowView,
  SelectionGroupsView,
} from "@/features/gallery/application/use-cases/list-selection-groups/list-selection-groups.types";

import type {
  LockSelectionAction,
  LockSelectionHandle,
} from "../use-lock-selection/use-lock-selection.types";

export interface SelectionGroupsScreenProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly page: SelectionGroupsView;
  readonly lockAction: LockSelectionAction;
}

export interface GroupCardProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly group: OwnerGroupRowView;
  readonly lock: LockSelectionHandle;
}

export interface GroupsBannerProps {
  readonly page: SelectionGroupsView;
}
