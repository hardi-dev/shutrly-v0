import type { LockSelectionGroupResult } from "@/features/gallery/application/use-cases/lock-selection-group/lock-selection-group.types";
import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import type { LockIntent } from "@/features/gallery/domain/selection-group-status/selection-group-status.types";

export type LockSelectionAction = (
  workspaceId: string,
  projectId: string,
  input: { groupId: string; intent: LockIntent },
) => Promise<LockSelectionGroupResult>;

export interface UseLockSelectionInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly lockAction: LockSelectionAction;
}

/** The group and action a confirm dialog is open for. */
export interface LockTarget {
  readonly group: Pick<OwnerGroupView, "id" | "name" | "unit" | "usage">;
  readonly intent: LockIntent;
}

export interface LockSelectionHandle {
  readonly target: LockTarget | null;
  readonly isPending: boolean;
  readonly request: (target: LockTarget) => void;
  readonly confirm: () => void;
  readonly close: () => void;
}
