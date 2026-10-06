import "server-only";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import type { ClientGalleryReaderPort } from "@/features/gallery/application/ports/client-gallery-reader/client-gallery-reader.port";
import type { GalleryPhotoRecord } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { PHOTO_KINDS } from "@/features/gallery/domain/photo-classification/photo-classification";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";
import {
  PHOTO_COLUMNS,
  PHOTO_SOURCE_JOIN,
  SOURCE_CONFIG_JOIN,
  toPhotoRecord,
} from "./gallery-photo-sql";

/** Every visible, not-missing EDITED and PRINT photo of active sources, by kind then name (D-15, BR-DEL-002). @param db - the executor @param context - verified workspace @param galleryId - the gallery @returns the records */
async function selectFinishedPhotos(
  db: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<readonly GalleryPhotoRecord[]> {
  const rows = await db
    .select(PHOTO_COLUMNS)
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .innerJoin(workspaceSourceConfig, SOURCE_CONFIG_JOIN)
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.galleryId, galleryId),
        inArray(galleryPhoto.kind, ["EDITED", "PRINT"]),
        isNull(galleryPhoto.missingAt),
        isNull(gallerySource.removedAt),
      ),
    )
    .orderBy(asc(galleryPhoto.kind), asc(galleryPhoto.nameSortKey), asc(galleryPhoto.id));
  return rows.flatMap((row) => toPhotoRecord(row) ?? []);
}

/** Builds the client-only photo reads, always scoped by workspace and gallery (D-15). @param db - request database @returns the reader port */
export function createDrizzleClientGalleryReader(db: DbExecutor): ClientGalleryReaderPort {
  return {
    async findClientMediaPhoto(context, galleryId, photoId) {
      const row = (
        await db
          .select({
            externalFileId: galleryPhoto.externalFileId,
            resourceKey: galleryPhoto.resourceKey,
            fileName: galleryPhoto.fileName,
            kind: galleryPhoto.kind,
            missingAt: galleryPhoto.missingAt,
            removedAt: gallerySource.removedAt,
          })
          .from(galleryPhoto)
          .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
          .where(
            and(
              eq(galleryPhoto.workspaceId, context.workspaceId),
              eq(galleryPhoto.galleryId, galleryId),
              eq(galleryPhoto.id, photoId),
            ),
          )
      ).at(0);
      const kind = PHOTO_KINDS.find((candidate) => candidate === row?.kind);
      if (!row || !kind) return null;
      return {
        externalFileId: row.externalFileId,
        resourceKey: row.resourceKey,
        fileName: row.fileName,
        kind,
        missing: row.missingAt !== null,
        sourceRemoved: row.removedAt !== null,
      };
    },
    listFinishedPhotos: (context, galleryId) => selectFinishedPhotos(db, context, galleryId),
  };
}
