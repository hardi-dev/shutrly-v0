import "server-only";

import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";

import type {
  FolderMapEntry,
  FolderMappingRecord,
  MappableItem,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import {
  classifyPhoto,
  kindForPickMode,
} from "@/features/gallery/domain/photo-classification/photo-classification";
import type { FolderMapping } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { projectItem } from "../schema/booking/project";
import { galleryFolderMap } from "../schema/gallery/folder-map";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";

/** A source's subfolder mappings with each item's finished kind; items no longer for picks are skipped (F-20). @param db - the executor @param context - verified workspace @param sourceId - the gallery source @returns the mappings */
export async function selectFolderMappings(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<FolderMapping[]> {
  const rows = await db
    .select({
      path: galleryFolderMap.folderPath,
      projectItemId: galleryFolderMap.projectItemId,
      pickMode: projectItem.pickMode,
    })
    .from(galleryFolderMap)
    .innerJoin(
      projectItem,
      and(
        eq(projectItem.workspaceId, galleryFolderMap.workspaceId),
        eq(projectItem.id, galleryFolderMap.projectItemId),
      ),
    )
    .where(
      and(
        eq(galleryFolderMap.workspaceId, context.workspaceId),
        eq(galleryFolderMap.gallerySourceId, sourceId),
      ),
    );
  return rows.flatMap((row) =>
    row.pickMode === "COUNT" || row.pickMode === "QUANTITY"
      ? [{ path: row.path, projectItemId: row.projectItemId, kind: kindForPickMode(row.pickMode) }]
      : [],
  );
}

/** The folder paths of a source that hold present photos, by name; the root is left out (F-20). @param db - the executor @param context - verified workspace @param sourceId - the gallery source @returns the paths */
export async function selectFolderPaths(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ path: galleryPhoto.folderPath })
    .from(galleryPhoto)
    .where(
      and(
        eq(galleryPhoto.workspaceId, context.workspaceId),
        eq(galleryPhoto.gallerySourceId, sourceId),
        isNull(galleryPhoto.missingAt),
        ne(galleryPhoto.folderPath, ""),
      ),
    )
    .orderBy(asc(galleryPhoto.folderPath));
  return rows.map((row) => row.path);
}

/** Stores the subfolders a finished run found, empty ones too, and returns those not told to the Owner yet (F-20, Owner 2026-10-07: a photographer prepares folders before uploading). @param db - the executor @param context - verified workspace @param sourceId - the gallery source @param folders - every subfolder path the run found @returns the new paths */
export async function takeNewFolders(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
  folders: readonly string[],
): Promise<string[]> {
  const scope = and(
    eq(gallerySource.workspaceId, context.workspaceId),
    eq(gallerySource.id, sourceId),
  );
  const row = (
    await db.select({ known: gallerySource.knownFolders }).from(gallerySource).where(scope)
  ).at(0);
  if (!row) return [];
  const paths = [...new Set(folders)].sort((a, b) => a.localeCompare(b));
  const known = new Set(row.known);
  const fresh = paths.filter((path) => !known.has(path));
  if (fresh.length > 0 || paths.length !== known.size)
    await db.update(gallerySource).set({ knownFolders: paths }).where(scope);
  return fresh;
}

/** The project's selection items a subfolder can deliver for, in package order (F-20). */
async function selectMappableItems(
  db: DbExecutor,
  context: WorkspaceContext,
  projectId: string,
): Promise<MappableItem[]> {
  const items = await db
    .select({ id: projectItem.id, name: projectItem.name, pickMode: projectItem.pickMode })
    .from(projectItem)
    .where(
      and(
        eq(projectItem.workspaceId, context.workspaceId),
        eq(projectItem.projectId, projectId),
        eq(projectItem.selectionRequired, true),
      ),
    )
    .orderBy(asc(projectItem.sortOrder), asc(projectItem.name));
  return items.flatMap((item) =>
    item.pickMode === "COUNT" || item.pickMode === "QUANTITY"
      ? [{ id: item.id, name: item.name, pickMode: item.pickMode }]
      : [],
  );
}

function selectSavedMappings(db: DbExecutor, context: WorkspaceContext, sourceId: string) {
  return db
    .select({ path: galleryFolderMap.folderPath, projectItemId: galleryFolderMap.projectItemId })
    .from(galleryFolderMap)
    .where(
      and(
        eq(galleryFolderMap.workspaceId, context.workspaceId),
        eq(galleryFolderMap.gallerySourceId, sourceId),
      ),
    )
    .orderBy(asc(galleryFolderMap.folderPath));
}

/** The last run's folders, empty ones too, plus any folder holding photos (a source synced before the run kept its folders). */
function mergeFolders(known: readonly string[], withPhotos: readonly string[]): string[] {
  return [...new Set([...known, ...withPhotos])].sort((a, b) => a.localeCompare(b));
}

/** The folder *Edit*'s mapping view: the source's gallery, its folders, the project's selection items and the saved mapping (F-20). @param db - the executor @param context - verified workspace @param sourceId - the gallery source @returns the record, or null for a missing or removed source */
export async function selectFolderMapping(
  db: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
): Promise<FolderMappingRecord | null> {
  const source = (
    await db
      .select({
        galleryId: gallerySource.galleryId,
        projectId: gallery.projectId,
        known: gallerySource.knownFolders,
      })
      .from(gallerySource)
      .innerJoin(
        gallery,
        and(
          eq(gallery.workspaceId, gallerySource.workspaceId),
          eq(gallery.id, gallerySource.galleryId),
        ),
      )
      .where(
        and(
          eq(gallerySource.workspaceId, context.workspaceId),
          eq(gallerySource.id, sourceId),
          isNull(gallerySource.removedAt),
        ),
      )
  ).at(0);
  if (!source) return null;
  return {
    galleryId: source.galleryId,
    folders: mergeFolders(source.known, await selectFolderPaths(db, context, sourceId)),
    items: await selectMappableItems(db, context, source.projectId),
    mappings: await selectSavedMappings(db, context, sourceId),
  };
}

/** Replaces a source's mappings in the caller's transaction (F-20). @param tx - the transaction @param context - verified workspace @param sourceId - the gallery source @param entries - the new mappings */
export async function replaceFolderMappings(
  tx: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
  entries: readonly FolderMapEntry[],
): Promise<void> {
  await tx
    .delete(galleryFolderMap)
    .where(
      and(
        eq(galleryFolderMap.workspaceId, context.workspaceId),
        eq(galleryFolderMap.gallerySourceId, sourceId),
      ),
    );
  if (entries.length === 0) return;
  await tx.insert(galleryFolderMap).values(
    entries.map((entry) => ({
      workspaceId: context.workspaceId,
      gallerySourceId: sourceId,
      folderPath: entry.path,
      projectItemId: entry.projectItemId,
    })),
  );
}

/** Re-applies the mappings to every stored photo of a source, one update per folder path, writing only rows that change (F-20). @param tx - the transaction @param context - verified workspace @param sourceId - the gallery source @param mappings - the source's mappings @returns how many photos changed */
export async function reclassifySource(
  tx: DbExecutor,
  context: WorkspaceContext,
  sourceId: string,
  mappings: readonly FolderMapping[],
): Promise<number> {
  const scope = and(
    eq(galleryPhoto.workspaceId, context.workspaceId),
    eq(galleryPhoto.gallerySourceId, sourceId),
  );
  const paths = await tx
    .selectDistinct({ path: galleryPhoto.folderPath })
    .from(galleryPhoto)
    .where(scope);
  let changed = 0;
  for (const { path } of paths) {
    const placement = classifyPhoto(path === "" ? [] : path.split("/"), mappings);
    const rows = await tx
      .update(galleryPhoto)
      .set({
        kind: placement.kind,
        browsePath: placement.browsePath,
        projectItemId: placement.projectItemId,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          scope,
          eq(galleryPhoto.folderPath, path),
          sql`(${galleryPhoto.kind}, ${galleryPhoto.browsePath}, ${galleryPhoto.projectItemId}) is distinct from (${placement.kind}, ${placement.browsePath}, ${placement.projectItemId}::uuid)`,
        ),
      )
      .returning({ id: galleryPhoto.id });
    changed += rows.length;
  }
  return changed;
}
