import "server-only";

import { and, eq, isNull, ne, sql } from "drizzle-orm";

import type {
  GallerySourceRepositoryPort,
  GallerySourceWriter,
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
import {
  reclassifySource,
  replaceFolderMappings,
  selectFolderMapping,
  selectFolderMappings,
  takeNewFolders,
} from "./gallery-folder-map-sql";
import { lifecycleWriter } from "./gallery-lifecycle-sql";
import { lockGallery } from "./gallery-lock-sql";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";
import { insertGallerySource, isWorkspaceSourceActive } from "./gallery-source-link-sql";
import { claimStep, heldClaim, holdsClaim, releaseRun, writeStep } from "./gallery-sync-sql";

function sourceWriter(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): GallerySourceWriter {
  return {
    ...lifecycleWriter(tx, context, galleryId),
    isWorkspaceSourceActive: (workspaceSourceId) =>
      isWorkspaceSourceActive(tx, context, workspaceSourceId),
    insertSource: (source) => insertGallerySource(tx, context, galleryId, source),
    replaceFolderMappings: (sourceId, entries) =>
      replaceFolderMappings(tx, context, sourceId, entries),
    async reclassifySource(sourceId, mappings, now) {
      // F-20: changed kinds change what the client sees.
      if ((await reclassifySource(tx, context, sourceId, mappings)) === 0) return;
      await tx
        .update(gallery)
        .set({ contentVersion: sql`${gallery.contentVersion} + 1`, updatedAt: now })
        .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)));
    },
  };
}

// Only the columns a step needs: the stored cursor can be large and is read by the claim alone.
async function selectSyncRow(db: DbExecutor, context: WorkspaceContext, sourceId: string) {
  const rows = await db
    .select({
      galleryId: gallerySource.galleryId,
      providerFolderId: gallerySource.providerFolderId,
      resourceKey: gallerySource.resourceKey,
      removedAt: gallerySource.removedAt,
      syncStatus: gallerySource.syncStatus,
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
    .where(and(eq(gallerySource.workspaceId, context.workspaceId), eq(gallerySource.id, sourceId)));
  return rows.at(0);
}

async function findSyncTarget(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<Omit<SyncTarget, "mappings"> | null> {
  const row = await selectSyncRow(db, context, sourceId);
  const status = row ? toGalleryStatus(row.status) : null;
  const projectStatus = row ? toProjectStatus(row.projectStatus) : null;
  if (!row || !status || !projectStatus) return null;
  return {
    sourceId,
    galleryId: row.galleryId,
    folder: { folderId: row.providerFolderId, resourceKey: row.resourceKey },
    removed: row.removedAt !== null,
    runOpen: row.syncStatus === "SYNCING",
    gallery: {
      galleryId: row.galleryId,
      status,
      expiresAt: row.expiresAt,
      expiryDays: row.expiryDays,
      projectStatus,
    },
  };
}

// F-20: the step reads the mappings once; commitStep's re-check doesn't need them.
async function findSyncTargetWithMappings(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<SyncTarget | null> {
  const target = await findSyncTarget(db, context, sourceId);
  if (!target) return null;
  return { ...target, mappings: await selectFolderMappings(db, context, sourceId) };
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
  galleryId: string | null,
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
        galleryId === null ? undefined : ne(gallerySource.galleryId, galleryId),
      ),
    );
  return rows.map((row) => row.title);
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
    findSyncTarget: (context, sourceId) => findSyncTargetWithMappings(db, context, sourceId),
    takeNewFolders: (context, sourceId) => takeNewFolders(db, context, sourceId),
    findFolderMapping: (context, sourceId) => selectFolderMapping(db, context, sourceId),
    findGalleryIdByProject: (context, projectId) => findGalleryIdByProject(db, context, projectId),
    listActiveSources: (context, galleryId) => listActiveSources(db, context, galleryId),
    claimStep: (context, sourceId, now) => claimStep(db, context, sourceId, now),
    commitStep: (context, claim, step, now) =>
      db.transaction(async (tx) => {
        const target = await findSyncTarget(tx, context, claim.sourceId);
        const locked = target ? await lockGallery(tx, context, target.galleryId) : null;
        if (!(await holdsClaim(tx, context, claim))) return false;
        const open =
          locked !== null &&
          canSync(
            effectiveGalleryStatus(locked.status, locked.expiresAt, now),
            locked.projectStatus,
          );
        // Archived, cancelled or removed meanwhile: discard the step (TD › Concurrency).
        if (!target || !open || target.removed) {
          await releaseRun(tx, context, claim, now);
          return false;
        }
        await writeStep(tx, context, target.galleryId, claim, step, now);
        return true;
      }),
    async failRun(context, claim, code: SyncFailureCode, now) {
      await db
        .update(gallerySource)
        .set({
          syncStatus: "FAILED",
          syncErrorCode: code,
          syncStartedAt: null,
          syncLeaseAt: null,
          syncCursor: null,
          lastSyncAttemptAt: now,
          updatedAt: now,
        })
        .where(heldClaim(context, claim));
    },
  };
}
