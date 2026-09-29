import type { Control } from "react-hook-form";
import type { z } from "zod";

import type { createWorkspaceSchema } from "../../application/use-cases/create-workspace/create-workspace.schema";

export interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  action: (formData: FormData) => Promise<void>;
}

export type CreateWorkspaceFormValues = z.input<typeof createWorkspaceSchema>;

export interface CreateWorkspaceFormProps {
  action: CreateWorkspaceDialogProps["action"];
  includeSubmit?: boolean;
  isPending?: boolean;
  onPendingChange?: (isPending: boolean) => void;
}

export interface CreateWorkspaceNameFieldProps {
  control: Control<CreateWorkspaceFormValues>;
}
