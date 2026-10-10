import { nameSortKey } from "../name-sort-key/name-sort-key";
import { classifyPhoto } from "../photo-classification/photo-classification";
import type { FolderMapping } from "../photo-classification/photo-classification.types";
import type { FolderEntry, SyncedPhoto } from "./sync-plan.types";

export const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
export const DRIVE_SHORTCUT_MIME = "application/vnd.google-apps.shortcut";

/** Builds the stored photo of an image entry from the folders above it (BR-GAL-006, BR-GAL-007, D-13). @param entry - the Drive entry @param segments - folder names from the source root to the entry @param mappings - the source's subfolder mappings (F-21) @returns the photo to store */
export function toPhoto(
  entry: FolderEntry,
  segments: readonly string[],
  mappings: readonly FolderMapping[] = [],
): SyncedPhoto {
  const placement = classifyPhoto(segments, mappings);
  return {
    externalFileId: entry.id,
    resourceKey: entry.resourceKey,
    fileName: entry.name,
    mimeType: entry.mimeType,
    nameSortKey: nameSortKey(entry.name),
    kind: placement.kind,
    folderPath: segments.join("/"),
    browsePath: placement.browsePath,
    projectItemId: placement.projectItemId,
  };
}
