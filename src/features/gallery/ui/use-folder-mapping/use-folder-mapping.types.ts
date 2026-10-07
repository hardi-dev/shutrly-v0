import type { FolderMappingView } from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface UseFolderMappingInput {
  readonly workspaceId: string;
  readonly sourceId: string;
  readonly folderMappingAction: GalleryPageActions["folderMappingAction"];
}

export interface FolderMappingState {
  /** Null while loading or after a failed load. */
  readonly view: FolderMappingView | null;
  readonly hasFailed: boolean;
  /** The item chosen for a subfolder, or null for *Tetap foto proof*. */
  readonly itemOf: (path: string) => string | null;
  readonly choose: (path: string, projectItemId: string | null) => void;
  readonly isDirty: boolean;
  readonly entries: () => { path: string; projectItemId: string }[];
}
