import "server-only";

import type { DriveFolderRef } from "@/features/gallery/domain/drive-folder-link/drive-folder-link.types";
import type {
  GalleryProjectStatus,
  GalleryStoredStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type {
  SyncedPhoto,
  SyncFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

// The gallery and project state a source write re-checks under lock (D-8, D-14).
export interface LockedGalleryState {
  readonly galleryId: string;
  readonly status: GalleryStoredStatus;
  readonly expiresAt: Date | null;
  readonly projectStatus: GalleryProjectStatus;
}

export interface NewGallerySource {
  readonly workspaceSourceId: string;
  readonly folder: DriveFolderRef;
  readonly label: string | null;
  readonly actorId: string;
}

export interface InsertedSource {
  readonly sourceId: string;
}

export interface GallerySourceWriter {
  /** True when the workspace source exists and is active (BR-SRC-006). */
  readonly isWorkspaceSourceActive: (workspaceSourceId: string) => Promise<boolean>;
  readonly insertSource: (
    source: NewGallerySource,
  ) => Promise<InsertedSource | "FOLDER_ALREADY_LINKED">;
}

export interface SyncTarget {
  readonly sourceId: string;
  readonly galleryId: string;
  readonly folder: DriveFolderRef;
  readonly removed: boolean;
  readonly gallery: LockedGalleryState;
}

export interface SyncClaim {
  readonly sourceId: string;
  readonly startedAt: Date;
}

export interface SyncSuccess {
  readonly folderName: string;
  readonly photos: readonly SyncedPhoto[];
  readonly ignoredCount: number;
  readonly tooDeepCount: number;
}

export interface GallerySourceRepositoryPort {
  readonly withLockedGallery: <T>(
    context: WorkspaceContext,
    galleryId: string,
    work: (gallery: LockedGalleryState, writer: GallerySourceWriter) => Promise<T>,
  ) => Promise<T | "NOT_FOUND">;
  /** Project titles of other galleries in the workspace with this folder linked (AC-GAL-010). */
  readonly findFolderUse: (
    context: WorkspaceContext,
    galleryId: string,
    folderId: string,
  ) => Promise<readonly string[]>;
  readonly findSyncTarget: (
    context: WorkspaceContext,
    sourceId: string,
  ) => Promise<SyncTarget | null>;
  /** The conditional claim of D-8: null while another sync runs (younger than 10 minutes). */
  readonly claimSync: (
    context: WorkspaceContext,
    sourceId: string,
    now: Date,
  ) => Promise<SyncClaim | null>;
  /** Writes a listing in one transaction after re-checking the state; false when it was discarded. */
  readonly completeSync: (
    context: WorkspaceContext,
    claim: SyncClaim,
    result: SyncSuccess,
    now: Date,
  ) => Promise<boolean>;
  readonly failSync: (
    context: WorkspaceContext,
    claim: SyncClaim,
    code: SyncFailureCode,
    now: Date,
  ) => Promise<void>;
}
