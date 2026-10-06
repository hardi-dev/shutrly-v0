import "server-only";

import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";

import type { GalleryLifecycleWriter } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";

type FinalDeliveryWrites = Pick<
  GalleryLifecycleWriter,
  "countFinishedFiles" | "publishFinalDelivery"
>;

/** Final-delivery reads and writes for a gallery locked in `tx` (BR-DEL-003, F-10 D-17). @param tx - the transaction holding the gallery lock @param context - verified workspace @param galleryId - the locked gallery @returns the writes */
export function finalDeliveryWrites(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): FinalDeliveryWrites {
  return {
    async countFinishedFiles() {
      const rows = await tx
        .select({ total: count() })
        .from(galleryPhoto)
        .innerJoin(
          gallerySource,
          and(
            eq(gallerySource.workspaceId, galleryPhoto.workspaceId),
            eq(gallerySource.id, galleryPhoto.gallerySourceId),
          ),
        )
        .where(
          and(
            eq(galleryPhoto.workspaceId, context.workspaceId),
            eq(galleryPhoto.galleryId, galleryId),
            inArray(galleryPhoto.kind, ["EDITED", "PRINT"]),
            isNull(galleryPhoto.missingAt),
            isNull(gallerySource.removedAt),
          ),
        );
      return rows.at(0)?.total ?? 0;
    },
    async publishFinalDelivery(actorId, now) {
      await tx
        .update(gallery)
        .set({
          finalDeliveryPublishedAt: now,
          finalDeliveryPublishedBy: actorId,
          contentVersion: sql`${gallery.contentVersion} + 1`,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)));
    },
  };
}
