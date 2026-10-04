import "server-only";

import type {
  GalleryProjectStatus,
  GalleryStoredStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { EncryptedPassword } from "../gallery-password-cipher/gallery-password-cipher.port";

// Project facts the gallery needs, read through its own port (D-14).
export interface GalleryProjectFacts {
  readonly id: string;
  readonly status: GalleryProjectStatus;
  readonly title: string;
  readonly clientName: string;
}

export interface NewGallery {
  readonly id: string;
  readonly projectId: string;
  readonly password: EncryptedPassword;
  readonly passwordHash: string;
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
  readonly actorId: string;
}

export interface GalleryCreateWriter {
  readonly insert: (gallery: NewGallery) => Promise<"CREATED" | "ALREADY_EXISTS">;
}

export interface GalleryPhotoCounts {
  readonly proof: number;
  readonly edited: number;
  readonly print: number;
  readonly missing: number;
}

export interface GalleryRecord {
  readonly id: string;
  readonly status: GalleryStoredStatus;
  readonly password: EncryptedPassword;
  readonly passwordVersion: number;
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
  readonly publishedAt: Date | null;
  readonly archivedAt: Date | null;
}

export type GallerySyncStatus = "NEVER" | "SYNCING" | "SUCCEEDED" | "FAILED";
export type GallerySyncErrorCode = "NOT_PUBLIC" | "RATE_LIMITED" | "UNAVAILABLE" | "TOO_LARGE";

export interface GallerySourceRecord {
  readonly id: string;
  readonly label: string | null;
  readonly folderName: string | null;
  readonly workspaceSourceName: string;
  readonly removedAt: Date | null;
  readonly syncStatus: GallerySyncStatus;
  readonly syncErrorCode: GallerySyncErrorCode | null;
  readonly lastSyncedAt: Date | null;
  readonly proofCount: number;
  readonly editedCount: number;
  readonly printCount: number;
  readonly ignoredCount: number;
  readonly missingCount: number;
  readonly tooDeepCount: number;
}

export interface GallerySummaryRecord {
  readonly gallery: GalleryRecord;
  readonly activeSourceCount: number;
  readonly failedSourceCount: number;
  readonly counts: GalleryPhotoCounts;
}

export interface GalleryCardRecord {
  readonly project: GalleryProjectFacts;
  readonly summary: GallerySummaryRecord | null;
}

export interface GalleryPhotoRecord {
  readonly id: string;
  readonly fileName: string;
  readonly kind: PhotoKind;
  readonly folderPath: string;
  readonly browsePath: string;
  readonly sourceId: string;
  readonly sourceName: string | null;
  readonly externalFileId: string;
  readonly resourceKey: string | null;
  readonly missing: boolean;
}

export interface GalleryPageRecord {
  readonly project: GalleryProjectFacts;
  readonly summary: GallerySummaryRecord;
  readonly sources: readonly GallerySourceRecord[];
  /** The first photos for the *Foto* card: proof first, then by file name (D-12). */
  readonly previewPhotos: readonly GalleryPhotoRecord[];
}

// What the Owner media endpoint needs; never leaves the server (D-10).
export interface MediaPhotoRecord {
  readonly externalFileId: string;
  readonly resourceKey: string | null;
  readonly missing: boolean;
  readonly sourceRemoved: boolean;
}

export interface GalleryRepositoryPort {
  readonly findProjectFacts: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<GalleryProjectFacts | null>;
  readonly withProjectForGallery: <T>(
    context: WorkspaceContext,
    projectId: string,
    work: (project: GalleryProjectFacts, writer: GalleryCreateWriter) => Promise<T>,
  ) => Promise<T | "NOT_FOUND">;
  readonly findCard: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<GalleryCardRecord | null>;
  readonly findPage: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<GalleryPageRecord | null>;
  readonly findMediaPhoto: (
    context: WorkspaceContext,
    photoId: string,
  ) => Promise<MediaPhotoRecord | null>;
}
