export interface ServiceDetailDeleteDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onConfirm: () => Promise<void>;
}
