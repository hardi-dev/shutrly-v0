import type { AddSourceInput } from "../../application/schemas/add-source/add-source.types";
import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";

export interface AddSourceDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    values: AddSourceInput,
  ) => Promise<SourceValidationFailure | undefined>;
}
