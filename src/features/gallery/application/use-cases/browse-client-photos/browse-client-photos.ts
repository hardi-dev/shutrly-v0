import "server-only";

import { clientListKey } from "@/features/gallery/domain/client-list-key/client-list-key";
import { clientBrowseKind } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";

import type { ClientListCachePort } from "../../ports/client-list-cache/client-list-cache.port";
import { browsePageSchema } from "../../schemas/browse-page/browse-page.schema";
import { browseQuerySchema } from "../../schemas/browse-query/browse-query.schema";
import { browseGalleryPhotos } from "../browse-gallery-photos/browse-gallery-photos";
import type { BrowsePageView } from "../browse-gallery-photos/browse-gallery-photos.types";
import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ClientBrowseDeps, ClientBrowsePageView } from "./browse-client-photos.types";

async function readCached(cache: ClientListCachePort, key: string): Promise<BrowsePageView | null> {
  try {
    const json = await cache.read(key);
    const parsed = json === null ? null : browsePageSchema.safeParse(JSON.parse(json));
    return parsed?.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** One browse page, from the cache when its key matches the gallery's content version (D-22): views are built afterwards, so a cached page never carries a token. @param deps - reader and cache @param client - the signed-in client @param query - the validated query, or the raw input @returns the page */
async function readPage(
  deps: ClientBrowseDeps,
  client: ClientContext,
  query: unknown,
): Promise<BrowsePageView> {
  const context = { workspaceId: client.workspaceId };
  const parsed = browseQuerySchema.safeParse(query);
  if (!parsed.success) return browseGalleryPhotos(deps.browse, context, client.galleryId, query);
  const key = clientListKey({
    ...parsed.data,
    galleryId: client.galleryId,
    contentVersion: client.contentVersion,
  });
  const cached = await readCached(deps.cache, key);
  if (cached) return cached;
  const page = await browseGalleryPhotos(deps.browse, context, client.galleryId, parsed.data);
  await deps.cache.write(key, JSON.stringify(page)).catch(() => undefined);
  return page;
}

/**
 * Reads one page of the client's *Semua foto* (visible proofs) or, once final delivery is published,
 * of *Hasil akhir* (EDITED / PRINT): the F-09 folder levels and search, as client views
 * (BR-DEL-002, BR-GAL-006/007, D-15, AC-ACC-011).
 * @param deps - the client browse reader and whether direct images are on
 * @param client - the signed-in client context
 * @param input - untrusted browse query; a finished kind before delivery reads proofs
 * @returns the page
 * @throws GalleryError NOT_FOUND for a malformed query
 */
export async function browseClientPhotos(
  deps: ClientBrowseDeps,
  client: ClientContext,
  input: unknown,
): Promise<ClientBrowsePageView> {
  const parsed = browseQuerySchema.safeParse(input);
  const query = parsed.success
    ? { ...parsed.data, kind: clientBrowseKind(parsed.data.kind, client.finalDeliveryPublished) }
    : input;
  const page = await readPage(deps, client, query);
  return {
    mode: page.mode,
    proofTotal: page.totals.proof,
    editedTotal: client.finalDeliveryPublished ? page.totals.edited : 0,
    printTotal: client.finalDeliveryPublished ? page.totals.print : 0,
    sourceId: page.sourceId,
    isSingleSource: page.isSingleSource,
    folders: page.folders,
    summary: page.summary,
    photos: page.photos.map((photo) => toClientPhotoView(photo, client.token, deps.directImages)),
    nextCursor: page.nextCursor,
  };
}
