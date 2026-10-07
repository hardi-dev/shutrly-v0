import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";

import type {
  SyncClaim,
  SyncStepResult,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import { parseSyncCursor } from "@/features/gallery/application/schemas/sync-cursor/sync-cursor";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";

const UPSERT_CHUNK = 500;
// D-8: a step's lease holds for this long, and a run restarts when it is older than the run limit.
const LEASE_MS = 2 * 60 * 1000;
const RUN_MAX_AGE_MS = 30 * 60 * 1000;

function sourceScope(context: WorkspaceContext, sourceId: string) {
  return and(eq(gallerySource.workspaceId, context.workspaceId), eq(gallerySource.id, sourceId));
}

/** Claims one step of a source's sync run (D-8): starts a run when none is open or the open one is too old, or continues the open run once its last step's lease has expired. @param db - database @param context - verified workspace @param sourceId - the source id @param now - the claim instant @returns the claim with the stored cursor, or null while another step holds the run */
export async function claimStep(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
  now: Date,
): Promise<SyncClaim | null> {
  const leaseExpired = new Date(now.getTime() - LEASE_MS);
  const runExpired = new Date(now.getTime() - RUN_MAX_AGE_MS);
  const startsRun = sql`(${gallerySource.syncStatus} <> 'SYNCING' or ${gallerySource.syncStartedAt} is null or ${gallerySource.syncStartedAt} < ${runExpired})`;
  const rows = await db
    .update(gallerySource)
    .set({
      syncStatus: "SYNCING",
      syncStartedAt: sql`case when ${startsRun} then ${now} else ${gallerySource.syncStartedAt} end`,
      syncCursor: sql`case when ${startsRun} then null else ${gallerySource.syncCursor} end`,
      syncLeaseAt: now,
    })
    .where(
      and(
        sourceScope(context, sourceId),
        isNull(gallerySource.removedAt),
        sql`(${startsRun} or ${gallerySource.syncLeaseAt} is null or ${gallerySource.syncLeaseAt} < ${leaseExpired})`,
      ),
    )
    .returning({ startedAt: gallerySource.syncStartedAt, cursor: gallerySource.syncCursor });
  const row = rows.at(0);
  if (!row?.startedAt) return null;
  return { sourceId, startedAt: row.startedAt, leaseAt: now, cursor: parseSyncCursor(row.cursor) };
}

/** Narrows an update to the step that still holds the run. @param context - verified workspace @param claim - the step's claim @returns the where clause */
export function heldClaim(context: WorkspaceContext, claim: SyncClaim) {
  return and(
    sourceScope(context, claim.sourceId),
    eq(gallerySource.syncStatus, "SYNCING"),
    eq(gallerySource.syncStartedAt, claim.startedAt),
    eq(gallerySource.syncLeaseAt, claim.leaseAt),
  );
}

/** Tells whether a step still holds its run, locking the source row so no other step commits meanwhile. @param tx - the transaction @param context - verified workspace @param claim - the step's claim @returns true while the claim is held */
export async function holdsClaim(
  tx: DbExecutor,
  context: WorkspaceContext,
  claim: SyncClaim,
): Promise<boolean> {
  const rows = await tx
    .select({ id: gallerySource.id })
    .from(gallerySource)
    .where(heldClaim(context, claim))
    .for("update");
  return rows.length > 0;
}

// An unchanged row is neither rewritten nor given a new version (ADR-019, D-21).
const CHANGED = sql`(${galleryPhoto.fileName}, ${galleryPhoto.mimeType}, ${galleryPhoto.nameSortKey}, ${galleryPhoto.kind}, ${galleryPhoto.folderPath}, ${galleryPhoto.browsePath}, ${galleryPhoto.projectItemId}, ${galleryPhoto.resourceKey}, ${galleryPhoto.missingAt}) is distinct from (excluded.file_name, excluded.mime_type, excluded.name_sort_key, excluded.kind, excluded.folder_path, excluded.browse_path, excluded.project_item_id, excluded.resource_key, null)`;

async function upsertChanged(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
  sourceId: string,
  photos: SyncStepResult["photos"],
): Promise<number> {
  const rows = photos.map((photo) => ({
    ...photo,
    workspaceId: context.workspaceId,
    galleryId,
    gallerySourceId: sourceId,
  }));
  let written = 0;
  for (let start = 0; start < rows.length; start += UPSERT_CHUNK) {
    const done = await tx
      .insert(galleryPhoto)
      .values(rows.slice(start, start + UPSERT_CHUNK))
      .onConflictDoUpdate({
        target: [galleryPhoto.gallerySourceId, galleryPhoto.externalFileId],
        set: {
          resourceKey: sql`excluded.resource_key`,
          fileName: sql`excluded.file_name`,
          mimeType: sql`excluded.mime_type`,
          nameSortKey: sql`excluded.name_sort_key`,
          kind: sql`excluded.kind`,
          folderPath: sql`excluded.folder_path`,
          browsePath: sql`excluded.browse_path`,
          projectItemId: sql`excluded.project_item_id`,
          missingAt: null,
          updatedAt: sql`now()`,
        },
        setWhere: CHANGED,
      })
      .returning({ id: galleryPhoto.id });
    written += done.length;
  }
  return written;
}

/** A source's stored row counts, from its photos (BR-GAL-006); a reclassify refreshes them too (F-20). @param tx - the executor @param context - verified workspace @param sourceId - the gallery source @returns the counts */
export async function presentCounts(tx: DbExecutor, context: WorkspaceContext, sourceId: string) {
  const present = (kind: string) =>
    sql<number>`(count(*) filter (where ${galleryPhoto.kind} = ${kind} and ${galleryPhoto.missingAt} is null))::int`;
  const rows = await tx
    .select({
      proofCount: present("PROOF"),
      editedCount: present("EDITED"),
      printCount: present("PRINT"),
      missingCount: sql<number>`(count(*) filter (where ${galleryPhoto.missingAt} is not null))::int`,
    })
    .from(galleryPhoto)
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.gallerySourceId, sourceId),
      ),
    );
  return rows.at(0) ?? { proofCount: 0, editedCount: 0, printCount: 0, missingCount: 0 };
}

async function finishRun(
  tx: DbExecutor,
  context: WorkspaceContext,
  claim: SyncClaim,
  step: SyncStepResult,
  now: Date,
): Promise<number> {
  // One set-based statement: every photo this run never saw is missing (BR-GAL-006, D-21).
  const marked = await tx
    .update(galleryPhoto)
    .set({ missingAt: now, updatedAt: now })
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.gallerySourceId, claim.sourceId),
        isNull(galleryPhoto.missingAt),
        sql`${galleryPhoto.externalFileId} <> all(${sql.param([...step.cursor.seen])}::text[])`,
      ),
    )
    .returning({ id: galleryPhoto.id });
  const counts = await presentCounts(tx, context, claim.sourceId);
  await tx
    .update(gallerySource)
    .set({
      syncStatus: "SUCCEEDED",
      syncStartedAt: null,
      syncLeaseAt: null,
      syncCursor: null,
      syncErrorCode: null,
      folderName: step.cursor.folderName,
      lastSyncedAt: now,
      lastSyncAttemptAt: now,
      ...counts,
      ignoredCount: step.cursor.ignoredCount,
      tooDeepCount: step.cursor.tooDeepCount,
      updatedAt: now,
    })
    .where(heldClaim(context, claim));
  return marked.length;
}

/** Writes one finished step: its changed photos, then either the next cursor or, on the last step, the missing marks, the counts and `SUCCEEDED`, and bumps the gallery's content version when a photo row changed (BR-GAL-006, D-21, D-24). @param tx - the transaction, with the gallery locked @param context - verified workspace @param galleryId - the gallery @param claim - the step's held claim @param step - the step's photos, cursor and end flag @param now - the write instant */
export async function writeStep(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
  claim: SyncClaim,
  step: SyncStepResult,
  now: Date,
): Promise<void> {
  let changed = await upsertChanged(tx, context, galleryId, claim.sourceId, step.photos);
  if (step.done) changed += await finishRun(tx, context, claim, step, now);
  else {
    await tx
      .update(gallerySource)
      .set({ syncCursor: step.cursor, syncLeaseAt: null, updatedAt: now })
      .where(heldClaim(context, claim));
  }
  // A re-sync that changed nothing leaves the version alone, so a client cache stays valid (D-24).
  if (changed === 0) return;
  await tx
    .update(gallery)
    .set({ contentVersion: sql`${gallery.contentVersion} + 1`, updatedAt: now })
    .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)));
}

/** Ends a run without writing a listing: back to its last settled status, with the cursor and lease cleared (archived, cancelled or removed meanwhile). @param tx - the transaction @param context - verified workspace @param claim - the step's claim @param now - the instant */
export async function releaseRun(
  tx: DbExecutor,
  context: WorkspaceContext,
  claim: SyncClaim,
  now: Date,
): Promise<void> {
  await tx
    .update(gallerySource)
    .set({
      syncStatus: sql`case when ${gallerySource.lastSyncedAt} is null then 'NEVER' else 'SUCCEEDED' end`,
      syncStartedAt: null,
      syncLeaseAt: null,
      syncCursor: null,
      updatedAt: now,
    })
    .where(heldClaim(context, claim));
}
