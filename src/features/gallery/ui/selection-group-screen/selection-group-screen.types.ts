import type { ReactNode } from "react";

import type { SelectionGroupDetailView } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail.types";

import type {
  LockSelectionAction,
  LockSelectionHandle,
} from "../use-lock-selection/use-lock-selection.types";

export interface SelectionGroupScreenProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly detail: SelectionGroupDetailView;
  readonly lockAction: LockSelectionAction;
}

export interface DetailActionsProps {
  readonly detail: SelectionGroupDetailView;
  readonly lock: LockSelectionHandle;
}

export interface DetailAlertsProps {
  readonly detail: SelectionGroupDetailView;
}

export interface FactProps {
  readonly label: string;
  readonly children: ReactNode;
}

export interface PicksCardProps extends DetailAlertsProps {
  readonly workspaceId: string;
}
