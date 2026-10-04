import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type {
  FolderScope,
  GalleryBrowseReaderPort,
  KindTotals,
} from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import { browseQuerySchema } from "../../schemas/browse-query/browse-query.schema";
import { toPhotoView } from "../gallery-views/gallery-views";
import type { BrowsePageView, FolderTileView, SearchQuery } from "./browse-gallery-photos.types";

// A-13: the grid loads 48 photos per page.
export const BROWSE_PAGE_SIZE = 48;

function childPath(parent: string, name: string): string {
  return parent === "" ? name : `${parent}/${name}`;
}

async function searchPage(
  reader: GalleryBrowseReaderPort,
  context: WorkspaceContext,
  galleryId: string,
  query: SearchQuery,
  totals: KindTotals,
): Promise<BrowsePageView> {
  const page = await reader.searchPhotos(
    context,
    galleryId,
    query.search,
    query.cursor,
    BROWSE_PAGE_SIZE,
  );
  return {
    mode: "SEARCH",
    totals,
    sourceId: null,
    isSingleSource: false,
    folders: [],
    summary: { folderCount: 0, photoCount: page.total },
    photos: page.photos.map(toPhotoView),
    nextCursor: page.nextCursor,
  };
}

async function folderPage(
  reader: GalleryBrowseReaderPort,
  context: WorkspaceContext,
  scope: FolderScope,
  base: Pick<BrowsePageView, "totals" | "isSingleSource">,
  cursor: BrowsePageView["nextCursor"],
): Promise<BrowsePageView> {
  const isFirst = cursor === null;
  const children = isFirst ? await reader.childFolders(context, scope) : [];
  const folders: FolderTileView[] = children.map((child) => ({
    name: child.name,
    count: child.count,
    sourceId: scope.sourceId,
    path: childPath(scope.path, child.name),
  }));
  const page = await reader.folderPhotos(context, scope, cursor, BROWSE_PAGE_SIZE);
  const photoCount = isFirst ? await reader.folderTotal(context, scope) : 0;
  return {
    ...base,
    mode: "FOLDER",
    sourceId: scope.sourceId,
    folders,
    summary: isFirst ? { folderCount: folders.length, photoCount } : null,
    photos: page.photos.map(toPhotoView),
    nextCursor: page.nextCursor,
  };
}

/** Reads one page of *Semua foto*: the source folders, one folder level (subfolders first, then 48 photos in name order) or a file-name search (BR-GAL-007, A-12, A-13, AC-GAL-028…030). @param reader - browse reader @param context - verified workspace @param galleryId - the gallery id @param input - untrusted browse query @returns the page @throws GalleryError NOT_FOUND for another workspace's gallery or a bad query */
export async function browseGalleryPhotos(
  reader: GalleryBrowseReaderPort,
  context: WorkspaceContext,
  galleryId: string,
  input: unknown,
): Promise<BrowsePageView> {
  const parsed = browseQuerySchema.safeParse(input);
  if (!parsed.success || !(await reader.galleryExists(context, galleryId)))
    throw new GalleryError("NOT_FOUND");
  const query = parsed.data;
  const totals = await reader.kindTotals(context, galleryId);
  if (query.search !== "") return searchPage(reader, context, galleryId, query, totals);
  const sources = await reader.activeSources(context, galleryId);
  const only = sources.length === 1 ? sources[0] : null;
  const sourceId = query.sourceId ?? only?.sourceId ?? null;
  const base = { totals, isSingleSource: only !== null };
  if (sourceId !== null) {
    const scope = { galleryId, kind: query.kind, sourceId, path: query.path };
    return folderPage(reader, context, scope, base, query.cursor);
  }
  const folders = (await reader.sourceFolders(context, galleryId, query.kind)).map((source) => ({
    name: source.name ?? "",
    count: source.count,
    sourceId: source.sourceId,
    path: "",
  }));
  return {
    ...base,
    mode: "SOURCES",
    sourceId: null,
    folders,
    summary: null,
    photos: [],
    nextCursor: null,
  };
}
