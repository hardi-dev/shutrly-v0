import type { SourceNameInput } from "../../application/schemas/source-name/source-name.types";
import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";
import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";

export interface RenameSourceDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly source: PhotoSourceItem;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    sourceId: string,
    values: SourceNameInput,
  ) => Promise<SourceValidationFailure | undefined>;
}
