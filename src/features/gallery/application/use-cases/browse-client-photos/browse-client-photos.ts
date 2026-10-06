import "server-only";

import { clientBrowseKind } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";

import { browseQuerySchema } from "../../schemas/browse-query/browse-query.schema";
import { browseGalleryPhotos } from "../browse-gallery-photos/browse-gallery-photos";
import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ClientBrowseDeps, ClientBrowsePageView } from "./browse-client-photos.types";

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
  const context = { workspaceId: client.workspaceId };
  const page = await browseGalleryPhotos(deps.browse, context, client.galleryId, query);
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
