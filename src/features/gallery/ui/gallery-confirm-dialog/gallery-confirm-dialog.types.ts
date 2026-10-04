export interface GalleryConfirmDialogProps {
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly isPending: boolean;
  readonly isDestructive?: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}
