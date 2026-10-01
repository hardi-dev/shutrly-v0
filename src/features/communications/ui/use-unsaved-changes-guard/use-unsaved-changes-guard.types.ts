export interface UnsavedChangesGuard {
  isConfirmOpen: boolean;
  stay: () => void;
  leave: () => void;
}
