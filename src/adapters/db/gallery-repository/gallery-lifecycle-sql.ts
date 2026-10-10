import "server-only";

import { and, count, eq, isNull, type SQL, sql } from "drizzle-orm";

import type { GalleryLifecycleWriter } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { photoSelection } from "../schema/gallery/selection";
import { finalDeliveryWrites } from "./final-delivery-sql";
import { insertSelectionGroups } from "./selection-group-sql";

type SourceWrites = Pick<GalleryLifecycleWriter, "countActiveSources">;
type SourceEditWrites = Pick<
  GalleryLifecycleWriter,
  "countSourcePicks" | "deleteSource" | "renameSource"
>;
type StatusWrites = Pick<
  GalleryLifecycleWriter,
  "publish" | "setExpiry" | "archive" | "deleteGallery"
>;

interface SourceScope {
  readonly tx: DbExecutor;
  readonly context: WorkspaceContext;
  /** The gallery's active sources (BR-GAL-009). */
  readonly active: SQL | undefined;
  /** A change a client could see raises the gallery's content version (D-24). */
  readonly bumpContentVersion: (now: Date) => Promise<void>;
}

function sourceScope(tx: DbExecutor, context: WorkspaceContext, galleryId: string): SourceScope {
  return {
    tx,
    context,
    active: and(
      eq(gallerySource.workspaceId, context.workspaceId),
      eq(gallerySource.galleryId, galleryId),
      isNull(gallerySource.removedAt),
    ),
    async bumpContentVersion(now) {
      await tx
        .update(gallery)
        .set({ contentVersion: sql`${gallery.contentVersion} + 1`, updatedAt: now })
        .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)));
    },
  };
}

function sourceWrites({ tx, active }: SourceScope): SourceWrites {
  return {
    async countActiveSources() {
      const rows = await tx.select({ total: count() }).from(gallerySource).where(active);
      return rows.at(0)?.total ?? 0;
    },
  };
}

function sourceEditWrites({
  tx,
  context,
  active,
  bumpContentVersion,
}: SourceScope): SourceEditWrites {
  return {
    async countSourcePicks(sourceId) {
      const rows = await tx
        .select({ total: count() })
        .from(photoSelection)
        .innerJoin(
          galleryPhoto,
          and(
            eq(galleryPhoto.workspaceId, photoSelection.workspaceId),
            eq(galleryPhoto.id, photoSelection.photoId),
          ),
        )
        .where(
          and(
            eq(photoSelection.workspaceId, context.workspaceId),
            eq(galleryPhoto.gallerySourceId, sourceId),
          ),
        );
      return rows.at(0)?.total ?? 0;
    },
    async deleteSource(sourceId, now) {
      // Photos go with their source (ON DELETE CASCADE); a pick still referencing one is RESTRICT.
      const rows = await tx
        .delete(gallerySource)
        .where(and(active, eq(gallerySource.id, sourceId)))
        .returning({ id: gallerySource.id });
      if (rows.length === 0) return false;
      await bumpContentVersion(now);
      return true;
    },
    async renameSource(sourceId, label, now) {
      const rows = await tx
        .update(gallerySource)
        .set({ label, updatedAt: now })
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
          contentVersion: sql`${gallery.contentVersion} + 1`,
          ...expiry,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
    async setExpiry(expiry, actorId, now) {
      await tx
        .update(gallery)
        .set({
          ...expiry,
          contentVersion: sql`${gallery.contentVersion} + 1`,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
    async archive(actorId, now) {
      await tx
        .update(gallery)
        .set({
          status: "ARCHIVED",
          contentVersion: sql`${gallery.contentVersion} + 1`,
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
    ...sourceWrites(sourceScope(tx, context, galleryId)),
    ...sourceEditWrites(sourceScope(tx, context, galleryId)),
    ...statusWrites(tx, scope),
    createSelectionGroups: () => insertSelectionGroups(tx, context, galleryId),
    ...finalDeliveryWrites(tx, context, galleryId),
    async rotatePassword(rotated, actorId, now) {
      await tx
        .update(gallery)
        .set({
          passwordCiphertext: rotated.password.ciphertext,
          passwordIv: rotated.password.iv,
          passwordKeyVersion: rotated.password.keyVersion,
          passwordHash: rotated.passwordHash,
          passwordVersion: sql`${gallery.passwordVersion} + 1`,
          contentVersion: sql`${gallery.contentVersion} + 1`,
          passwordChangedAt: now,
          passwordChangedBy: actorId,
          updatedBy: actorId,
          updatedAt: now,
        })
        .where(scope);
    },
  };
}
