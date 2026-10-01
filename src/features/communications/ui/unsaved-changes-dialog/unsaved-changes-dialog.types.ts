export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isMobile: boolean;
  templateLabel: string;
  onStay: () => void;
  onLeave: () => void;
}
