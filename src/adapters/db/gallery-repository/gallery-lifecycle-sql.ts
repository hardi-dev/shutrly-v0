import "server-only";

import { and, count, eq, isNull, type SQL, sql } from "drizzle-orm";

import type { GalleryLifecycleWriter } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery, gallerySource } from "../schema/gallery/gallery";

type SourceWrites = Pick<GalleryLifecycleWriter, "countActiveSources" | "removeSource">;
type StatusWrites = Pick<
  GalleryLifecycleWriter,
  "publish" | "setExpiry" | "archive" | "deleteGallery"
>;

function sourceWrites(tx: DbExecutor, context: WorkspaceContext, galleryId: string): SourceWrites {
  const active = and(
    eq(gallerySource.workspaceId, context.workspaceId),
    eq(gallerySource.galleryId, galleryId),
    isNull(gallerySource.removedAt),
  );
  return {
    async countActiveSources() {
      const rows = await tx.select({ total: count() }).from(gallerySource).where(active);
      return rows.at(0)?.total ?? 0;
    },
    async removeSource(sourceId, actorId, now) {
      const rows = await tx
        .update(gallerySource)
        .set({ removedAt: now, removedBy: actorId, updatedAt: now })
        .where(and(active, eq(gallerySource.id, sourceId)))
        .returning({ id: gallerySource.id });
      return rows.length > 0;
    },
  };
}

function statusWrites(tx: DbExecutor, scope: SQL | undefined): StatusWrites {
  return {
    async publish(expiry, actorId, now) {
      await tx
        .update(gallery)
        .set({
          status: "PUBLISHED",
          publishedAt: now,
          ...expiry,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
    async setExpiry(expiry, actorId, now) {
      await tx
        .update(gallery)
        .set({ ...expiry, updatedBy: actorId, updatedAt: now })
        .where(scope);
    },
    async archive(actorId, now) {
      await tx
        .update(gallery)
        .set({
          status: "ARCHIVED",
          archivedAt: now,
          archivedBy: actorId,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
    async deleteGallery() {
      await tx.delete(gallery).where(scope);
    },
  };
}

/** Builds the lifecycle writes for a locked gallery inside its transaction (BR-GAL-003…005, BR-GAL-009, BR-AUD-001, D-18). @param tx - the transaction holding the gallery lock @param context - verified workspace @param galleryId - the locked gallery @returns the lifecycle writer */
export function lifecycleWriter(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): GalleryLifecycleWriter {
  const scope = and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId));
  return {
    ...sourceWrites(tx, context, galleryId),
    ...statusWrites(tx, scope),
    async rotatePassword(rotated, actorId, now) {
      await tx
        .update(gallery)
        .set({
          passwordCiphertext: rotated.password.ciphertext,
          passwordIv: rotated.password.iv,
          passwordKeyVersion: rotated.password.keyVersion,
          passwordHash: rotated.passwordHash,
          passwordVersion: sql`${gallery.passwordVersion} + 1`,
          passwordChangedAt: now,
          passwordChangedBy: actorId,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
  };
}
