import type { SyncedPhoto, SyncFailureCode } from "../sync-plan/sync-plan.types";

// One folder still to read; a folder whose listing has a next page keeps its page token (TD D-20).
export interface CursorFolder {
  readonly folderId: string;
  readonly resourceKey: string | null;
  readonly segments: readonly string[];
  readonly pageToken: string | null;
}

// What is left of a sync run between two steps, plus what it has found so far (TD D-20, D-21).
export interface SyncCursor {
  readonly folderName: string;
  readonly queue: readonly CursorFolder[];
  readonly seen: readonly string[];
  readonly ignoredCount: number;
  readonly tooDeepCount: number;
  readonly foldersDone: number;
  readonly listCalls: number;
}

export interface SyncBudget {
  readonly maxListCalls: number;
  readonly maxEntries: number;
  readonly maxPhotos: number;
}

export interface SyncProgress {
  readonly foldersDone: number;
  readonly foldersTotal: number;
}

export type StepWalk =
  | {
      readonly ok: true;
      /** The images found in this step only; earlier steps already wrote theirs. */
      readonly photos: readonly SyncedPhoto[];
      readonly cursor: SyncCursor;
      readonly done: boolean;
    }
  | { readonly ok: false; readonly code: SyncFailureCode };
