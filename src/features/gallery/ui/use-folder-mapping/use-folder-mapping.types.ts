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
  /** The subfolder chosen for a package item, or null for none. */
  readonly folderOf: (itemId: string) => string | null;
  /** Whether another item already has this subfolder; one subfolder serves one item. */
  readonly isTakenByOther: (path: string, itemId: string) => boolean;
  readonly chooseFolder: (itemId: string, path: string | null) => void;
  readonly isDirty: boolean;
  readonly entries: () => { path: string; projectItemId: string }[];
}
