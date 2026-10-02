import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";

export interface SourceRowActionsProps {
  readonly workspaceId: string;
  readonly source: PhotoSourceItem;
  readonly onRename: () => void;
  readonly onDelete: () => void;
  readonly setActiveAction: (
    workspaceId: string,
    sourceId: string,
    isActive: boolean,
  ) => Promise<void>;
}
