export interface RotateLink {
  readonly isOpen: boolean;
  readonly isPending: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly confirm: () => void;
}
