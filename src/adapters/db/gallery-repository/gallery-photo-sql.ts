import "server-only";

import { and, asc, eq, isNull, sql } from "drizzle-orm";

import type {
  GalleryPhotoRecord,
  MediaPhotoRecord,
} from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { PHOTO_KINDS } from "@/features/gallery/domain/photo-classification/photo-classification";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { galleryPhoto, gallerySource } from "../schema/gallery/gallery";

export const PREVIEW_PHOTO_COUNT = 8;

/** The columns of an Owner photo row, joined with its source. */
export const PHOTO_COLUMNS = {
  id: galleryPhoto.id,
  fileName: galleryPhoto.fileName,
  kind: galleryPhoto.kind,
  folderPath: galleryPhoto.folderPath,
  browsePath: galleryPhoto.browsePath,
  sourceId: galleryPhoto.gallerySourceId,
  sourceName: sql<string | null>`coalesce(${gallerySource.label}, ${gallerySource.folderName})`,
  externalFileId: galleryPhoto.externalFileId,
  resourceKey: galleryPhoto.resourceKey,
  missingAt: galleryPhoto.missingAt,
};

export const PHOTO_SOURCE_JOIN = and(
  eq(gallerySource.workspaceId, galleryPhoto.workspaceId),
  eq(gallerySource.id, galleryPhoto.gallerySourceId),
);

interface PhotoRow {
  id: string;
  fileName: string;
  kind: string;
  folderPath: string;
  browsePath: string;
  sourceId: string;
  sourceName: string | null;
  externalFileId: string;
  resourceKey: string | null;
  missingAt: Date | null;
}

/** Maps a photo row to the port record; the kind check constraint guarantees a known kind. @param row - the selected row @returns the record, or null for an unknown kind */
export function toPhotoRecord(row: PhotoRow): GalleryPhotoRecord | null {
  const kind = PHOTO_KINDS.find((candidate) => candidate === row.kind);
  if (!kind) return null;
  const { missingAt, ...rest } = row;
  return { ...rest, kind, missing: missingAt !== null };
}

/** Reads the *Foto* card's first photos of active sources: proof first, then by natural file name (D-12, AC-GAL-014). @param db - database @param context - verified workspace @param galleryId - the gallery id @returns up to 8 photos */
export async function selectPreviewPhotos(
  db: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<GalleryPhotoRecord[]> {
  const rows = await db
    .select(PHOTO_COLUMNS)
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.galleryId, galleryId),
        isNull(gallerySource.removedAt),
      ),
    )
    .orderBy(
      sql`case ${galleryPhoto.kind} when 'PROOF' then 0 when 'EDITED' then 1 else 2 end`,
      asc(galleryPhoto.nameSortKey),
      asc(galleryPhoto.id),
    )
    .limit(PREVIEW_PHOTO_COUNT);
  return rows.flatMap((row) => toPhotoRecord(row) ?? []);
}

/** Reads what the Owner media endpoint needs about one photo, scoped by workspace (C-101, D-10). @param db - database @param context - verified workspace @param photoId - the photo id @returns the media record or null */
export async function selectMediaPhoto(
  db: DbExecutor,
  context: WorkspaceContext,
  photoId: string,
): Promise<MediaPhotoRecord | null> {
  const row = (
    await db
      .select({
        externalFileId: galleryPhoto.externalFileId,
        resourceKey: galleryPhoto.resourceKey,
        missingAt: galleryPhoto.missingAt,
        removedAt: gallerySource.removedAt,
      })
      .from(galleryPhoto)
      .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
      .where(and(eq(galleryPhoto.workspaceId, context.workspaceId), eq(galleryPhoto.id, photoId)))
  ).at(0);
  if (!row) return null;
  return {
    externalFileId: row.externalFileId,
    resourceKey: row.resourceKey,
    missing: row.missingAt !== null,
    sourceRemoved: row.removedAt !== null,
  };
}
