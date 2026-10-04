import type { DriveFolderRef } from "../drive-folder-link/drive-folder-link.types";
import { nameSortKey } from "../name-sort-key/name-sort-key";
import {
  classifyPhoto,
  isImageMime,
  SYNC_LIMITS,
  SYNC_MAX_DEPTH,
} from "../photo-classification/photo-classification";
import type { SyncLimits } from "../photo-classification/photo-classification.types";
import type {
  FolderEntry,
  ListFolder,
  SyncedPhoto,
  SyncFailureCode,
  TreeWalk,
} from "./sync-plan.types";

export const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
export const DRIVE_SHORTCUT_MIME = "application/vnd.google-apps.shortcut";

interface QueuedFolder {
  readonly ref: DriveFolderRef;
  readonly segments: readonly string[];
}

interface WalkState {
  readonly queue: QueuedFolder[];
  readonly photos: SyncedPhoto[];
  calls: number;
  ignoredCount: number;
  tooDeepCount: number;
}

/** Builds the stored photo of an image entry from the folders above it (BR-GAL-006, BR-GAL-007, D-13). @param entry - the Drive entry @param segments - folder names from the source root to the entry @returns the photo to store */
export function toPhoto(entry: FolderEntry, segments: readonly string[]): SyncedPhoto {
  const placement = classifyPhoto(segments);
  return {
    externalFileId: entry.id,
    resourceKey: entry.resourceKey,
    fileName: entry.name,
    mimeType: entry.mimeType,
    nameSortKey: nameSortKey(entry.name),
    kind: placement.kind,
    folderPath: segments.join("/"),
    browsePath: placement.browsePath,
  };
}

function place(state: WalkState, folder: QueuedFolder, entry: FolderEntry): void {
  if (entry.mimeType === DRIVE_SHORTCUT_MIME) return;
  if (entry.mimeType === DRIVE_FOLDER_MIME) {
    const segments = [...folder.segments, entry.name];
    if (segments.length > SYNC_MAX_DEPTH) state.tooDeepCount += 1;
    else
      state.queue.push({ ref: { folderId: entry.id, resourceKey: entry.resourceKey }, segments });
  } else if (isImageMime(entry.mimeType)) state.photos.push(toPhoto(entry, folder.segments));
  else state.ignoredCount += 1;
}

async function walkFolder(
  listFolder: ListFolder,
  state: WalkState,
  folder: QueuedFolder,
  limits: SyncLimits,
): Promise<SyncFailureCode | null> {
  let pageToken: string | null = null;
  do {
    if (state.calls >= limits.maxListCalls) return "TOO_LARGE";
    state.calls += 1;
    const listing = await listFolder(folder.ref, pageToken);
    if (!listing.ok) return listing.code;
    for (const entry of listing.entries) place(state, folder, entry);
    if (state.photos.length > limits.maxPhotos) return "TOO_LARGE";
    pageToken = listing.nextPageToken;
  } while (pageToken !== null);
  return null;
}

/** Walks a source's folder tree breadth-first: images become photos, other files are ignored, shortcuts skipped and folders deeper than 5 counted (BR-GAL-006, BR-GAL-007, A-9, A-14, D-7). @param listFolder - one page of a folder's children @param root - the source folder @param limits - the per-sync budget @returns the photos and counts, or why the walk stopped */
export async function walkFolderTree(
  listFolder: ListFolder,
  root: DriveFolderRef,
  limits: SyncLimits = SYNC_LIMITS,
): Promise<TreeWalk> {
  const state: WalkState = {
    queue: [{ ref: root, segments: [] }],
    photos: [],
    calls: 0,
    ignoredCount: 0,
    tooDeepCount: 0,
  };
  for (let folder = state.queue.shift(); folder; folder = state.queue.shift()) {
    const failure = await walkFolder(listFolder, state, folder, limits);
    if (failure !== null) return { ok: false, code: failure };
  }
  return {
    ok: true,
    photos: state.photos,
    ignoredCount: state.ignoredCount,
    tooDeepCount: state.tooDeepCount,
  };
}
