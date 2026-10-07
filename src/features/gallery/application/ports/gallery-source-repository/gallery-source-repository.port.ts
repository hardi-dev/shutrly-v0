import "server-only";

import type { DriveFolderRef } from "@/features/gallery/domain/drive-folder-link/drive-folder-link.types";
import type {
  GalleryProjectStatus,
  GalleryStoredStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { FolderMapping } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { PickMode } from "@/features/gallery/domain/pick-list/pick-list.types";
import type {
  SyncedPhoto,
  SyncFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { SyncCursor } from "@/features/gallery/domain/sync-step/sync-step.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { EncryptedPassword } from "../gallery-password-cipher/gallery-password-cipher.port";

// The gallery and project state a source write re-checks under lock (D-8, D-14).
export interface LockedGalleryState {
  readonly galleryId: string;
  readonly status: GalleryStoredStatus;
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
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

export interface GalleryExpiryColumns {
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
}

export interface RotatedPassword {
  readonly password: EncryptedPassword;
  readonly passwordHash: string;
}

export interface ActiveSourceRecord {
  readonly sourceId: string;
  readonly name: string | null;
  readonly folder: DriveFolderRef;
}

// Lifecycle writes under the gallery lock (BR-GAL-003…005, BR-GAL-009, BR-AUD-001, D-18).
export interface GalleryLifecycleWriter {
  readonly countActiveSources: () => Promise<number>;
  /** Client picks of photos from this source (BR-GAL-009: they block deleting it). */
  readonly countSourcePicks: (sourceId: string) => Promise<number>;
  /** Deletes an active source with its photos (cascade); false when it isn't an active source of this gallery. */
  readonly deleteSource: (sourceId: string, now: Date) => Promise<boolean>;
  /** Sets an active source's label, null to show the folder name; false when it isn't an active source of this gallery. */
  readonly renameSource: (sourceId: string, label: string | null, now: Date) => Promise<boolean>;
  readonly publish: (expiry: GalleryExpiryColumns, actorId: string, now: Date) => Promise<void>;
  readonly setExpiry: (expiry: GalleryExpiryColumns, actorId: string, now: Date) => Promise<void>;
  readonly rotatePassword: (rotated: RotatedPassword, actorId: string, now: Date) => Promise<void>;
  readonly archive: (actorId: string, now: Date) => Promise<void>;
  /** Deletes the gallery with its sources and photo records (cascade). */
  readonly deleteGallery: () => Promise<void>;
  /** Creates one OPEN group per selection item that has none yet (F-10 D-10a); returns how many. */
  readonly createSelectionGroups: () => Promise<number>;
  /** Visible, not-missing EDITED and PRINT photos of active sources (BR-DEL-003, F-10 D-17). */
  readonly countFinishedFiles: () => Promise<number>;
  /** Records final delivery with who and when and bumps content_version (BR-AUD-001, D-17, D-22). */
  readonly publishFinalDelivery: (actorId: string, now: Date) => Promise<void>;
}

/** One saved subfolder mapping (F-20). */
export interface FolderMapEntry {
  readonly path: string;
  readonly projectItemId: string;
}

/** A selection item of the project's package that a subfolder can deliver for (F-20). */
export interface MappableItem {
  readonly id: string;
  readonly name: string;
  readonly pickMode: PickMode;
}

/** What the folder *Edit* shows: the subfolders the last sync found, the package's selection items and the saved mapping (F-20). */
export interface FolderMappingRecord {
  readonly galleryId: string;
  readonly folders: readonly string[];
  readonly items: readonly MappableItem[];
  readonly mappings: readonly FolderMapEntry[];
}

export interface GallerySourceWriter extends GalleryLifecycleWriter {
  /** Replaces a source's subfolder mappings (F-20). */
  readonly replaceFolderMappings: (
    sourceId: string,
    entries: readonly FolderMapEntry[],
  ) => Promise<void>;
  /** Re-applies the mappings to the source's stored photos and bumps the content version (F-20). */
  readonly reclassifySource: (
    sourceId: string,
    mappings: readonly FolderMapping[],
    now: Date,
  ) => Promise<void>;
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
  /** A run is open (`SYNCING`): the next step continues it instead of starting one (D-8). */
  readonly runOpen: boolean;
  readonly gallery: LockedGalleryState;
  /** The source's subfolder mappings with each item's finished kind (F-20). */
  readonly mappings: readonly FolderMapping[];
}

// The hold on one step of a run (D-8). `startedAt` is the run's identity, `leaseAt` this step's.
export interface SyncClaim {
  readonly sourceId: string;
  readonly startedAt: Date;
  readonly leaseAt: Date;
  /** What the run still has to read, or null at the start of a run. */
  readonly cursor: SyncCursor | null;
}

// What one finished step writes (D-21): its photos, the next cursor, and whether the run ends.
export interface SyncStepResult {
  readonly photos: readonly SyncedPhoto[];
  readonly cursor: SyncCursor;
  readonly done: boolean;
}

export interface GallerySourceRepositoryPort {
  readonly withLockedGallery: <T>(
    context: WorkspaceContext,
    galleryId: string,
    work: (gallery: LockedGalleryState, writer: GallerySourceWriter) => Promise<T>,
  ) => Promise<T | "NOT_FOUND">;
  /** Project titles of other galleries in the workspace with this folder linked; null `galleryId` for a gallery not created yet (AC-GAL-010). */
  readonly findFolderUse: (
    context: WorkspaceContext,
    galleryId: string | null,
    folderId: string,
  ) => Promise<readonly string[]>;
  /** The project's gallery id, or null when it has none (BR-GAL-001). */
  readonly findGalleryIdByProject: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<string | null>;
  readonly listActiveSources: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly ActiveSourceRecord[]>;
  readonly findSyncTarget: (
    context: WorkspaceContext,
    sourceId: string,
  ) => Promise<SyncTarget | null>;
  /** The conditional claim of D-8: starts a run, or continues one whose lease expired; null while another step holds it. */
  readonly claimStep: (
    context: WorkspaceContext,
    sourceId: string,
    now: Date,
  ) => Promise<SyncClaim | null>;
  /** Writes a step in one transaction after re-checking the state; false when it was discarded. */
  readonly commitStep: (
    context: WorkspaceContext,
    claim: SyncClaim,
    step: SyncStepResult,
    now: Date,
  ) => Promise<boolean>;
  /** The folder *Edit*'s mapping view of an active source, or null (F-20). */
  readonly findFolderMapping: (
    context: WorkspaceContext,
    sourceId: string,
  ) => Promise<FolderMappingRecord | null>;
  /** Stores the subfolders a finished run found, empty ones too, and returns those the Owner hasn't been told about yet (F-20). */
  readonly takeNewFolders: (
    context: WorkspaceContext,
    sourceId: string,
    folders: readonly string[],
  ) => Promise<readonly string[]>;
  /** Ends the run as failed and clears its cursor; photos earlier steps wrote stay (D-23). */
  readonly failRun: (
    context: WorkspaceContext,
    claim: SyncClaim,
    code: SyncFailureCode,
    now: Date,
  ) => Promise<void>;
}
