import "server-only";

import { browseQuerySchema } from "../../schemas/browse-query/browse-query.schema";
import { browseGalleryPhotos } from "../browse-gallery-photos/browse-gallery-photos";
import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ClientBrowseDeps, ClientBrowsePageView } from "./browse-client-photos.types";

/**
 * Reads one page of the client's *Semua foto*: the F-09 folder levels and search over visible
 * proofs only, as client views (BR-DEL-002, BR-GAL-006/007, D-15, AC-ACC-011).
 * @param deps - the client browse reader and whether direct images are on
 * @param client - the signed-in client context
 * @param input - untrusted browse query; its kind is ignored
 * @returns the page
 * @throws GalleryError NOT_FOUND for a malformed query
 */
export async function browseClientPhotos(
  deps: ClientBrowseDeps,
  client: ClientContext,
  input: unknown,
): Promise<ClientBrowsePageView> {
  const parsed = browseQuerySchema.safeParse(input);
  const query = parsed.success ? { ...parsed.data, kind: "PROOF" } : input;
  const context = { workspaceId: client.workspaceId };
  const page = await browseGalleryPhotos(deps.browse, context, client.galleryId, query);
  return {
    mode: page.mode,
    proofTotal: page.totals.proof,
    sourceId: page.sourceId,
    isSingleSource: page.isSingleSource,
    folders: page.folders,
    summary: page.summary,
    photos: page.photos.map((photo) => toClientPhotoView(photo, client.token, deps.directImages)),
    nextCursor: page.nextCursor,
  };
}
