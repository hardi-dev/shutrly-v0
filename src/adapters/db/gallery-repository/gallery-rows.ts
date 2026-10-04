import "server-only";

import type {
  GallerySourceRecord,
  GallerySyncErrorCode,
  GallerySyncStatus,
} from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import {
  GALLERY_PROJECT_STATUSES,
  GALLERY_STORED_STATUSES,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type {
  GalleryProjectStatus,
  GalleryStoredStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";

import type { gallerySource } from "../schema/gallery/gallery";

const SYNC_STATUSES: readonly GallerySyncStatus[] = ["NEVER", "SYNCING", "SUCCEEDED", "FAILED"];
const SYNC_ERROR_CODES: readonly GallerySyncErrorCode[] = [
  "NOT_PUBLIC",
  "RATE_LIMITED",
  "UNAVAILABLE",
  "TOO_LARGE",
];

function pick<T extends string>(values: readonly T[], value: string | null): T | null {
  return values.find((candidate) => candidate === value) ?? null;
}

/** Narrows a stored project status; the check constraint guarantees one matches. @param value - the column value @returns the status or null */
export function toProjectStatus(value: string): GalleryProjectStatus | null {
  return pick(GALLERY_PROJECT_STATUSES, value);
}

/** Narrows a stored gallery status (check `gallery_status_ck`). @param value - the column value @returns the status or null */
export function toGalleryStatus(value: string): GalleryStoredStatus | null {
  return pick(GALLERY_STORED_STATUSES, value);
}

/** Maps a `gallery_source` row joined with its workspace source name to the port record. @param row - the row @param workspaceSourceName - the F-04 source name @returns the source record */
export function toSourceRecord(
  row: typeof gallerySource.$inferSelect,
  workspaceSourceName: string,
): GallerySourceRecord {
  return {
    id: row.id,
    label: row.label,
    folderName: row.folderName,
    workspaceSourceName,
    removedAt: row.removedAt,
    syncStatus: pick(SYNC_STATUSES, row.syncStatus) ?? "NEVER",
    syncErrorCode: pick(SYNC_ERROR_CODES, row.syncErrorCode),
    lastSyncedAt: row.lastSyncedAt,
    proofCount: row.proofCount,
    editedCount: row.editedCount,
    printCount: row.printCount,
    ignoredCount: row.ignoredCount,
    missingCount: row.missingCount,
    tooDeepCount: row.tooDeepCount,
  };
}
