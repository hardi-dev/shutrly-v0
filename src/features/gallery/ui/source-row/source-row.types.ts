import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";
import type { SourceMutationActions } from "../use-source-mutations/use-source-mutations";

export interface PhotoSourceRowProps {
  readonly source: PhotoSourceItem;
  readonly isLast: boolean;
  readonly workspaceId?: string;
  readonly actions?: SourceMutationActions;
  readonly onRename?: (source: PhotoSourceItem) => void;
  readonly onDelete?: (source: PhotoSourceItem) => void;
}
