import "server-only";

import { and, eq, isNull, lt, sql } from "drizzle-orm";

import type {
  SyncClaim,
  SyncSuccess,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { galleryPhoto, gallerySource } from "../schema/gallery/gallery";

interface SyncWriteTarget {
  readonly galleryId: string;
  readonly claim: SyncClaim;
}

const UPSERT_CHUNK = 500;
// D-8: a crashed sync unlocks itself after this long.
const STALE_CLAIM_MS = 10 * 60 * 1000;

function sourceScope(context: WorkspaceContext, sourceId: string) {
  return and(eq(gallerySource.workspaceId, context.workspaceId), eq(gallerySource.id, sourceId));
}

/** Claims a source for syncing unless a younger sync holds it (D-8). @param db - database @param context - verified workspace @param sourceId - the source id @param now - the claim instant @returns the claim, or null while another sync runs */
export async function claimSync(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
  now: Date,
): Promise<SyncClaim | null> {
  const staleBefore = new Date(now.getTime() - STALE_CLAIM_MS);
  const rows = await db
    .update(gallerySource)
    .set({ syncStatus: "SYNCING", syncStartedAt: now })
    .where(
      and(
        sourceScope(context, sourceId),
        isNull(gallerySource.removedAt),
        sql`(${gallerySource.syncStatus} <> 'SYNCING' or ${gallerySource.syncStartedAt} < ${staleBefore})`,
      ),
    )
    .returning({ id: gallerySource.id });
  return rows.length === 0 ? null : { sourceId, startedAt: now };
}

/** Narrows the update to the claim that is still held. @param context - verified workspace @param claim - the sync claim @returns the where clause */
export function heldClaim(context: WorkspaceContext, claim: SyncClaim) {
  return and(
    sourceScope(context, claim.sourceId),
    eq(gallerySource.syncStatus, "SYNCING"),
    eq(gallerySource.syncStartedAt, claim.startedAt),
  );
}

async function upsertPhotos(
  tx: DbExecutor,
  context: WorkspaceContext,
  target: SyncWriteTarget,
  result: SyncSuccess,
): Promise<void> {
  const rows = result.photos.map((photo) => ({
    ...photo,
    workspaceId: context.workspaceId,
    galleryId: target.galleryId,
    gallerySourceId: target.claim.sourceId,
    lastSeenAt: target.claim.startedAt,
  }));
  for (let start = 0; start < rows.length; start += UPSERT_CHUNK) {
    await tx
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
          lastSeenAt: sql`excluded.last_seen_at`,
          missingAt: null,
          updatedAt: sql`now()`,
        },
      });
  }
}

async function presentCounts(tx: DbExecutor, context: WorkspaceContext, sourceId: string) {
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

/** Writes a finished listing: upserts photos, marks unseen ones missing and stores the counts (BR-GAL-006, D-8). @param tx - the transaction, with the gallery locked @param context - verified workspace @param target - the gallery and the held claim @param result - the walk result @param now - the write instant */
export async function writeSync(
  tx: DbExecutor,
  context: WorkspaceContext,
  target: SyncWriteTarget,
  result: SyncSuccess,
  now: Date,
): Promise<void> {
  await upsertPhotos(tx, context, target, result);
  await tx
    .update(galleryPhoto)
    .set({ missingAt: now, updatedAt: now })
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.gallerySourceId, target.claim.sourceId),
        lt(galleryPhoto.lastSeenAt, target.claim.startedAt),
        isNull(galleryPhoto.missingAt),
      ),
    );
  const counts = await presentCounts(tx, context, target.claim.sourceId);
  await tx
    .update(gallerySource)
    .set({
      syncStatus: "SUCCEEDED",
      syncStartedAt: null,
      syncErrorCode: null,
      folderName: result.folderName,
      lastSyncedAt: now,
      lastSyncAttemptAt: now,
      ...counts,
      ignoredCount: result.ignoredCount,
      tooDeepCount: result.tooDeepCount,
      updatedAt: now,
    })
    .where(heldClaim(context, target.claim));
}
