export interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  action: (formData: FormData) => Promise<void>;
}
