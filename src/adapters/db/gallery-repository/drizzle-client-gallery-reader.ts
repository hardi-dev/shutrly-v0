import "server-only";

import { and, eq } from "drizzle-orm";

import type { ClientGalleryReaderPort } from "@/features/gallery/application/ports/client-gallery-reader/client-gallery-reader.port";
import { PHOTO_KINDS } from "@/features/gallery/domain/photo-classification/photo-classification";

import type { DbExecutor } from "../client/client.types";
import { galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { PHOTO_SOURCE_JOIN } from "./gallery-photo-sql";

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
  };
}
