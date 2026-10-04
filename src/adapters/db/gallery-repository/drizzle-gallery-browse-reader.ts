import "server-only";

import { and, asc, count, eq, gt, ilike, isNull, or, type SQL, sql } from "drizzle-orm";

import type {
  BrowseCursor,
  FolderScope,
  GalleryBrowseReaderPort,
  PhotoPage,
} from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";
import {
  PHOTO_COLUMNS,
  PHOTO_SOURCE_JOIN,
  SOURCE_CONFIG_JOIN,
  toPhotoRecord,
} from "./gallery-photo-sql";

const LIKE_SPECIAL = /[\\%_]/g;

function visible(context: WorkspaceContext, galleryId: string): SQL | undefined {
  return and(
    eq(galleryPhoto.workspaceId, context.workspaceId),
    eq(galleryPhoto.galleryId, galleryId),
    isNull(gallerySource.removedAt),
  );
}

// The scope's folder and everything below it, on the folded path.
function underPath(path: string): SQL | undefined {
  if (path === "") return undefined;
  return or(
    eq(galleryPhoto.browsePath, path),
    sql`left(${galleryPhoto.browsePath}, ${path.length + 1}) = ${path + "/"}`,
  );
}

function inFolder(context: WorkspaceContext, scope: FolderScope): SQL | undefined {
  return and(
    visible(context, scope.galleryId),
    eq(galleryPhoto.kind, scope.kind),
    eq(galleryPhoto.gallerySourceId, scope.sourceId),
  );
}

function after(cursor: BrowseCursor | null): SQL | undefined {
  if (cursor === null) return undefined;
  return or(
    gt(galleryPhoto.nameSortKey, cursor.sortKey),
    and(eq(galleryPhoto.nameSortKey, cursor.sortKey), gt(galleryPhoto.id, cursor.id)),
  );
}

async function photoPage(
  db: DbExecutor,
  where: SQL | undefined,
  limit: number,
): Promise<PhotoPage> {
  const rows = await db
    .select({ ...PHOTO_COLUMNS, sortKey: galleryPhoto.nameSortKey })
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .innerJoin(workspaceSourceConfig, SOURCE_CONFIG_JOIN)
    .where(where)
    .orderBy(asc(galleryPhoto.nameSortKey), asc(galleryPhoto.id))
    .limit(limit + 1);
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  const nextCursor = rows.length > limit && last ? { sortKey: last.sortKey, id: last.id } : null;
  return { photos: page.flatMap((row) => toPhotoRecord(row) ?? []), nextCursor };
}

async function childFolders(db: DbExecutor, context: WorkspaceContext, scope: FolderScope) {
  const offset = scope.path === "" ? 0 : scope.path.length + 1;
  // An integer from the server, inlined so GROUP BY sees one expression (not two parameters).
  const start = sql.raw(String(offset + 1));
  const name = sql<string>`split_part(substr(${galleryPhoto.browsePath}, ${start}), '/', 1)`;
  const deeper =
    scope.path === ""
      ? sql`${galleryPhoto.browsePath} <> ''`
      : sql`left(${galleryPhoto.browsePath}, ${offset}) = ${scope.path + "/"}`;
  return db
    .select({ name, count: sql<number>`count(*)::int` })
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .where(and(inFolder(context, scope), deeper))
    .groupBy(name)
    .orderBy(sql`lower(${name})`);
}

async function countWhere(db: DbExecutor, where: SQL | undefined): Promise<number> {
  const rows = await db
    .select({ total: count() })
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .where(where);
  return rows.at(0)?.total ?? 0;
}

async function sourceCounts(db: DbExecutor, where: SQL | undefined) {
  return db
    .select({
      sourceId: gallerySource.id,
      name: sql<string | null>`coalesce(${gallerySource.label}, ${gallerySource.folderName})`,
      count: sql<number>`count(${galleryPhoto.id})::int`,
    })
    .from(gallerySource)
    .leftJoin(
      galleryPhoto,
      and(
        eq(galleryPhoto.workspaceId, gallerySource.workspaceId),
        eq(galleryPhoto.gallerySourceId, gallerySource.id),
      ),
    )
    .where(where)
    .groupBy(gallerySource.id)
    .orderBy(asc(gallerySource.createdAt), asc(gallerySource.id));
}

async function kindTotals(db: DbExecutor, context: WorkspaceContext, galleryId: string) {
  const total = (kind: string) =>
    sql<number>`(count(*) filter (where ${galleryPhoto.kind} = ${kind}))::int`;
  const rows = await db
    .select({ proof: total("PROOF"), edited: total("EDITED"), print: total("PRINT") })
    .from(galleryPhoto)
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .where(visible(context, galleryId));
  return rows.at(0) ?? { proof: 0, edited: 0, print: 0 };
}

function activeSourcesWhere(context: WorkspaceContext, galleryId: string) {
  return and(
    eq(gallerySource.workspaceId, context.workspaceId),
    eq(gallerySource.galleryId, galleryId),
    isNull(gallerySource.removedAt),
  );
}

/** Builds the *Semua foto* reader: folder levels on the folded path, keyset pages of 48 and file-name search (D-12, A-12, A-13). @param db - request database @returns the browse reader port */
export function createDrizzleGalleryBrowseReader(db: DbExecutor): GalleryBrowseReaderPort {
  return {
    async galleryExists(context, galleryId) {
      const rows = await db
        .select({ id: gallery.id })
        .from(gallery)
        .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)));
      return rows.length > 0;
    },
    kindTotals: (context, galleryId) => kindTotals(db, context, galleryId),
    async sourceFolders(context, galleryId, kind) {
      const rows = await sourceCounts(
        db,
        and(activeSourcesWhere(context, galleryId), eq(galleryPhoto.kind, kind)),
      );
      return rows.filter((row) => row.count > 0);
    },
    activeSources: (context, galleryId) => sourceCounts(db, activeSourcesWhere(context, galleryId)),
    childFolders: (context, scope) => childFolders(db, context, scope),
    folderTotal: (context, scope) =>
      countWhere(db, and(inFolder(context, scope), underPath(scope.path))),
    folderPhotos: (context, scope, cursor, limit) =>
      photoPage(
        db,
        and(inFolder(context, scope), eq(galleryPhoto.browsePath, scope.path), after(cursor)),
        limit,
      ),
    async searchPhotos(context, galleryId, text, cursor, limit) {
      const escaped = text.replace(LIKE_SPECIAL, (char) => "\\" + char);
      const pattern = `%${escaped}%`;
      const where = and(visible(context, galleryId), ilike(galleryPhoto.fileName, pattern));
      const [page, total] = await Promise.all([
        photoPage(db, and(where, after(cursor)), limit),
        countWhere(db, where),
      ]);
      return { ...page, total };
    },
  };
}
