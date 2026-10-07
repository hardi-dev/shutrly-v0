import type { DriveFolderRef } from "../drive-folder-link/drive-folder-link.types";
import {
  isImageMime,
  MAX_SYNC_PHOTOS,
  SYNC_MAX_DEPTH,
  SYNC_STEP_MAX_ENTRIES,
  SYNC_STEP_MAX_LIST_CALLS,
} from "../photo-classification/photo-classification";
import type { FolderMapping } from "../photo-classification/photo-classification.types";
import { DRIVE_FOLDER_MIME, DRIVE_SHORTCUT_MIME, toPhoto } from "../sync-plan/sync-plan";
import type {
  FolderEntry,
  ListFolder,
  SyncedPhoto,
  SyncFailureCode,
} from "../sync-plan/sync-plan.types";
import type {
  CursorFolder,
  StepWalk,
  SyncBudget,
  SyncCursor,
  SyncProgress,
} from "./sync-step.types";

export const SYNC_STEP_BUDGET: SyncBudget = {
  maxListCalls: SYNC_STEP_MAX_LIST_CALLS,
  maxEntries: SYNC_STEP_MAX_ENTRIES,
  maxPhotos: MAX_SYNC_PHOTOS,
};

interface StepState {
  queue: CursorFolder[];
  readonly photos: SyncedPhoto[];
  readonly seen: string[];
  ignoredCount: number;
  tooDeepCount: number;
  foldersDone: number;
  listCalls: number;
  stepCalls: number;
  stepEntries: number;
  /** The source's subfolder mappings, which decide each photo's kind (F-20). */
  readonly mappings: readonly FolderMapping[];
}

/** Makes the first cursor of a run: the source root is the only folder to read (TD D-20). @param root - the source folder @param folderName - the folder's name from the provider @returns the cursor of a run that has read nothing */
export function startCursor(root: DriveFolderRef, folderName: string): SyncCursor {
  return {
    folderName,
    queue: [
      { folderId: root.folderId, resourceKey: root.resourceKey, segments: [], pageToken: null },
    ],
    seen: [],
    ignoredCount: 0,
    tooDeepCount: 0,
    foldersDone: 0,
    listCalls: 0,
  };
}

/** Tells how far a run has come: folders read of folders known so far (the total grows as folders are found). @param cursor - the run's cursor @returns the progress for *Menyinkronkan… n dari m folder* */
export function syncProgress(cursor: SyncCursor): SyncProgress {
  return {
    foldersDone: cursor.foldersDone,
    foldersTotal: cursor.foldersDone + cursor.queue.length,
  };
}

function openState(cursor: SyncCursor, mappings: readonly FolderMapping[]): StepState {
  return {
    mappings,
    queue: [...cursor.queue],
    photos: [],
    seen: [...cursor.seen],
    ignoredCount: cursor.ignoredCount,
    tooDeepCount: cursor.tooDeepCount,
    foldersDone: cursor.foldersDone,
    listCalls: cursor.listCalls,
    stepCalls: 0,
    stepEntries: 0,
  };
}

function closeState(state: StepState, cursor: SyncCursor): SyncCursor {
  return {
    folderName: cursor.folderName,
    queue: state.queue,
    seen: state.seen,
    ignoredCount: state.ignoredCount,
    tooDeepCount: state.tooDeepCount,
    foldersDone: state.foldersDone,
    listCalls: state.listCalls,
  };
}

function place(state: StepState, folder: CursorFolder, entry: FolderEntry): void {
  if (entry.mimeType === DRIVE_SHORTCUT_MIME) return;
  if (entry.mimeType === DRIVE_FOLDER_MIME) {
    const segments = [...folder.segments, entry.name];
    if (segments.length > SYNC_MAX_DEPTH) state.tooDeepCount += 1;
    else
      state.queue.push({
        folderId: entry.id,
        resourceKey: entry.resourceKey,
        segments,
        pageToken: null,
      });
  } else if (isImageMime(entry.mimeType)) {
    state.photos.push(toPhoto(entry, folder.segments, state.mappings));
    state.seen.push(entry.id);
  } else state.ignoredCount += 1;
}

function budgetSpent(state: StepState, budget: SyncBudget): boolean {
  return state.stepCalls >= budget.maxListCalls || state.stepEntries >= budget.maxEntries;
}

async function readPage(
  listFolder: ListFolder,
  state: StepState,
  folder: CursorFolder,
  budget: SyncBudget,
): Promise<SyncFailureCode | null> {
  state.stepCalls += 1;
  state.listCalls += 1;
  const listing = await listFolder(
    { folderId: folder.folderId, resourceKey: folder.resourceKey },
    folder.pageToken,
  );
  if (!listing.ok) return listing.code;
  for (const entry of listing.entries) place(state, folder, entry);
  state.stepEntries += listing.entries.length;
  if (state.seen.length > budget.maxPhotos) return "TOO_LARGE";
  if (listing.nextPageToken === null) {
    state.queue.shift();
    state.foldersDone += 1;
  } else state.queue[0] = { ...folder, pageToken: listing.nextPageToken };
  return null;
}

/** Reads one step of a sync run: folders from the head of the queue until the step's list-call or entry budget is spent, or the tree ends. It is the breadth-first walk of BR-GAL-006 and BR-GAL-007, cut so each request fits Workers Free (ADR-018, TD D-7). @param listFolder - one page of a folder's children @param cursor - what the run still has to read @param budget - the step's limits @param mappings - the source's subfolder mappings (F-20) @returns the images found in this step, the next cursor and whether the run is done, or why it stopped */
export async function walkStep(
  listFolder: ListFolder,
  cursor: SyncCursor,
  budget: SyncBudget = SYNC_STEP_BUDGET,
  mappings: readonly FolderMapping[] = [],
): Promise<StepWalk> {
  const state = openState(cursor, mappings);
  for (
    let head = state.queue.at(0);
    head && !budgetSpent(state, budget);
    head = state.queue.at(0)
  ) {
    const failure = await readPage(listFolder, state, head, budget);
    if (failure !== null) return { ok: false, code: failure };
  }
  return {
    ok: true,
    photos: state.photos,
    cursor: closeState(state, cursor),
    done: state.queue.length === 0,
  };
}
