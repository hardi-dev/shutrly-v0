import type { LockTarget } from "../use-lock-selection/use-lock-selection.types";

export interface LockSelectionDialogProps {
  readonly target: LockTarget;
  readonly isPending: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}
