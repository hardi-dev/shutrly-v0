import "server-only";

import { driveFileUrl } from "@/features/gallery/domain/drive-folder-link/drive-folder-link";
import { effectiveGalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type {
  GalleryPhotoRecord,
  GalleryProjectFacts,
  GallerySourceRecord,
  GallerySummaryRecord,
} from "../../ports/gallery-repository/gallery-repository.port";
import type {
  GalleryPhotoView,
  GalleryProjectView,
  GallerySourceView,
  GallerySummaryView,
} from "./gallery-views.types";

/** Projects the facts the gallery screens show about a project. @param project - the project facts @returns the project view */
export function toProjectView(project: GalleryProjectFacts): GalleryProjectView {
  return { id: project.id, title: project.title, status: project.status };
}

/** Builds the Owner's gallery summary with the decrypted password and the derived status (ADR-017, D-1). @param summary - the stored summary @param cipher - password cipher @param context - verified workspace @param now - the current instant @returns the summary view */
export async function toSummaryView(
  summary: GallerySummaryRecord,
  cipher: GalleryPasswordCipherPort,
  context: WorkspaceContext,
  now: Date,
): Promise<GallerySummaryView> {
  const { gallery } = summary;
  const password = await cipher.decrypt(gallery.password, {
    workspaceId: context.workspaceId,
    galleryId: gallery.id,
  });
  return {
    id: gallery.id,
    status: effectiveGalleryStatus(gallery.status, gallery.expiresAt, now),
    password,
    expiresAt: gallery.expiresAt?.toISOString() ?? null,
    expiryDays: gallery.expiryDays,
    activeSourceCount: summary.activeSourceCount,
    failedSourceCount: summary.failedSourceCount,
    failedSourceNames: summary.failedSourceNames,
    counts: summary.counts,
  };
}

/** Builds a source row: its label, or the Drive folder name from the last sync (A-3). @param source - the stored source @returns the source view */
export function toSourceView(source: GallerySourceRecord): GallerySourceView {
  return {
    id: source.id,
    name: source.label ?? source.folderName,
    workspaceSourceName: source.workspaceSourceName,
    removed: source.removedAt !== null,
    removedAt: source.removedAt?.toISOString() ?? null,
    syncStatus: source.syncStatus,
    syncErrorCode: source.syncErrorCode,
    lastSyncedAt: source.lastSyncedAt?.toISOString() ?? null,
    proofCount: source.proofCount,
    editedCount: source.editedCount,
    printCount: source.printCount,
    ignoredCount: source.ignoredCount,
    missingCount: source.missingCount,
    tooDeepCount: source.tooDeepCount,
  };
}

/** Builds the Owner's photo DTO: the file ID and the Owner-only file link, never a folder ID or resource key of the source (D-11, D-26, TD › Security). @param photo - the stored photo @returns the photo view */
export function toPhotoView(photo: GalleryPhotoRecord): GalleryPhotoView {
  return {
    id: photo.id,
    externalFileId: photo.externalFileId,
    provider: photo.provider,
    fileName: photo.fileName,
    kind: photo.kind,
    folderPath: photo.folderPath,
    browsePath: photo.browsePath,
    sourceId: photo.sourceId,
    sourceName: photo.sourceName,
    missing: photo.missing,
    driveUrl: photo.missing ? null : driveFileUrl(photo.externalFileId, photo.resourceKey),
  };
}
