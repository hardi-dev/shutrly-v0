import "server-only";

import { and, eq, isNull, ne, sql } from "drizzle-orm";

import type {
  GallerySourceRepositoryPort,
  GallerySourceWriter,
  NewGallerySource,
  SyncClaim,
  SyncTarget,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import {
  canSync,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { SyncFailureCode } from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";
import { gallery, gallerySource } from "../schema/gallery/gallery";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";
import { lifecycleWriter } from "./gallery-lifecycle-sql";
import { lockGallery } from "./gallery-lock-sql";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";
import { claimSync, heldClaim, writeSync } from "./gallery-sync-sql";

function sourceWriter(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): GallerySourceWriter {
  return {
    ...lifecycleWriter(tx, context, galleryId),
    async isWorkspaceSourceActive(workspaceSourceId) {
      const rows = await tx
        .select({ isActive: workspaceSourceConfig.isActive })
        .from(workspaceSourceConfig)
        .where(
          and(
            eq(workspaceSourceConfig.workspaceId, context.workspaceId),
            eq(workspaceSourceConfig.id, workspaceSourceId),
          ),
        );
      return rows.at(0)?.isActive === true;
    },
    async insertSource(source: NewGallerySource) {
      // The partial unique index decides a concurrent duplicate too (AC-GAL-010).
      const rows = await tx
        .insert(gallerySource)
        .values({
          workspaceId: context.workspaceId,
          galleryId,
          workspaceSourceId: source.workspaceSourceId,
          providerFolderId: source.folder.folderId,
          resourceKey: source.folder.resourceKey,
          label: source.label,
          createdBy: source.actorId,
        })
        .onConflictDoNothing({
          target: [gallerySource.galleryId, gallerySource.providerFolderId],
          where: sql`removed_at is null`,
        })
        .returning({ id: gallerySource.id });
      const row = rows.at(0);
      return row ? { sourceId: row.id } : "FOLDER_ALREADY_LINKED";
    },
  };
}

async function findSyncTarget(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<SyncTarget | null> {
  const row = (
    await db
      .select({
        source: gallerySource,
        status: gallery.status,
        expiresAt: gallery.expiresAt,
        expiryDays: gallery.expiryDays,
        projectStatus: project.status,
      })
      .from(gallerySource)
      .innerJoin(
        gallery,
        and(
          eq(gallery.workspaceId, gallerySource.workspaceId),
          eq(gallery.id, gallerySource.galleryId),
        ),
      )
      .innerJoin(
        project,
        and(eq(project.workspaceId, gallery.workspaceId), eq(project.id, gallery.projectId)),
      )
      .where(
        and(eq(gallerySource.workspaceId, context.workspaceId), eq(gallerySource.id, sourceId)),
      )
  ).at(0);
  const status = row ? toGalleryStatus(row.status) : null;
  const projectStatus = row ? toProjectStatus(row.projectStatus) : null;
  if (!row || !status || !projectStatus) return null;
  const { source } = row;
  return {
    sourceId,
    galleryId: source.galleryId,
    folder: { folderId: source.providerFolderId, resourceKey: source.resourceKey },
    removed: source.removedAt !== null,
    gallery: {
      galleryId: source.galleryId,
      status,
      expiresAt: row.expiresAt,
      expiryDays: row.expiryDays,
      projectStatus,
    },
  };
}

async function findGalleryIdByProject(
  db: DbExecutor,
  context: WorkspaceContext,
  projectId: string,
) {
  const rows = await db
    .select({ id: gallery.id })
    .from(gallery)
    .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.projectId, projectId)));
  return rows.at(0)?.id ?? null;
}

async function listActiveSources(db: DbExecutor, context: WorkspaceContext, galleryId: string) {
  const rows = await db
    .select({
      sourceId: gallerySource.id,
      name: sql<string | null>`coalesce(${gallerySource.label}, ${gallerySource.folderName})`,
      folderId: gallerySource.providerFolderId,
      resourceKey: gallerySource.resourceKey,
    })
    .from(gallerySource)
    .where(
      and(
        eq(gallerySource.workspaceId, context.workspaceId),
        eq(gallerySource.galleryId, galleryId),
        isNull(gallerySource.removedAt),
      ),
    )
    .orderBy(gallerySource.createdAt);
  return rows.map((row) => ({
    sourceId: row.sourceId,
    name: row.name,
    folder: { folderId: row.folderId, resourceKey: row.resourceKey },
  }));
}

async function findFolderUse(
  db: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
  folderId: string,
) {
  const rows = await db
    .selectDistinct({ title: project.title })
    .from(gallerySource)
    .innerJoin(
      gallery,
      and(
        eq(gallery.workspaceId, gallerySource.workspaceId),
        eq(gallery.id, gallerySource.galleryId),
      ),
    )
    .innerJoin(
      project,
      and(eq(project.workspaceId, gallery.workspaceId), eq(project.id, gallery.projectId)),
    )
    .where(
      and(
        eq(gallerySource.workspaceId, context.workspaceId),
        eq(gallerySource.providerFolderId, folderId),
        isNull(gallerySource.removedAt),
        ne(gallerySource.galleryId, galleryId),
      ),
    );
  return rows.map((row) => row.title);
}

async function releaseClaim(
  tx: DbExecutor,
  context: WorkspaceContext,
  claim: SyncClaim,
  now: Date,
) {
  await tx
    .update(gallerySource)
    .set({
      syncStatus: sql`case when ${gallerySource.lastSyncedAt} is null then 'NEVER' else 'SUCCEEDED' end`,
      syncStartedAt: null,
      updatedAt: now,
    })
    .where(heldClaim(context, claim));
}

/** Builds the Drizzle repository for gallery sources and sync (D-8, BR-GAL-006, BR-GAL-009). @param db - request database or transaction @returns the source repository port */
export function createDrizzleGallerySourceRepository(db: DbExecutor): GallerySourceRepositoryPort {
  return {
    withLockedGallery: (context, galleryId, work) =>
      db.transaction(async (tx) => {
        const locked = await lockGallery(tx, context, galleryId);
        if (!locked) return "NOT_FOUND" as const;
        return work(locked, sourceWriter(tx, context, galleryId));
      }),
    findFolderUse: (context, galleryId, folderId) =>
      findFolderUse(db, context, galleryId, folderId),
    findSyncTarget: (context, sourceId) => findSyncTarget(db, context, sourceId),
    findGalleryIdByProject: (context, projectId) => findGalleryIdByProject(db, context, projectId),
    listActiveSources: (context, galleryId) => listActiveSources(db, context, galleryId),
    claimSync: (context, sourceId, now) => claimSync(db, context, sourceId, now),
    completeSync: (context, claim, result, now) =>
      db.transaction(async (tx) => {
        const target = await findSyncTarget(tx, context, claim.sourceId);
        const locked = target ? await lockGallery(tx, context, target.galleryId) : null;
        const open =
          locked !== null &&
          canSync(
            effectiveGalleryStatus(locked.status, locked.expiresAt, now),
            locked.projectStatus,
          );
        // Archived, cancelled or removed meanwhile: discard the listing (TD › Concurrency).
        if (!target || !open || target.removed) {
          await releaseClaim(tx, context, claim, now);
          return false;
        }
        await writeSync(tx, context, { galleryId: target.galleryId, claim }, result, now);
        return true;
      }),
    async failSync(context, claim, code: SyncFailureCode, now) {
      await db
        .update(gallerySource)
        .set({
          syncStatus: "FAILED",
          syncErrorCode: code,
          syncStartedAt: null,
          lastSyncAttemptAt: now,
          updatedAt: now,
        })
        .where(heldClaim(context, claim));
    },
  };
}
