import type { DeleteSourceResult } from "../../application/use-cases/delete-workspace-source/delete-workspace-source.types";
import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";

export interface DeleteSourceDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly source: PhotoSourceItem;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, sourceId: string) => Promise<DeleteSourceResult>;
}
