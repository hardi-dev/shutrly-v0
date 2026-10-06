import "server-only";

import { browseCursorSchema } from "../../schemas/browse-query/browse-query.schema";
import { BROWSE_PAGE_SIZE } from "../browse-gallery-photos/browse-gallery-photos";
import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { PickPhotosDeps, PickPhotosPage } from "./browse-pick-photos.types";

/**
 * Reads one page of Pilih's flat grid: every visible proof of the client's gallery across
 * folders, 48 at a time in file-name order (pilih exports, D-15, A-28).
 * @param deps - the client browse reader and whether direct images are on
 * @param client - the signed-in client context
 * @param rawCursor - untrusted cursor of the previous page, or null for the first
 * @returns the page; a malformed cursor reads the first page
 */
export async function browsePickPhotos(
  deps: PickPhotosDeps,
  client: ClientContext,
  rawCursor: unknown,
): Promise<PickPhotosPage> {
  const cursor = browseCursorSchema.nullable().safeParse(rawCursor);
  const page = await deps.browse.searchPhotos(
    { workspaceId: client.workspaceId },
    client.galleryId,
    "",
    cursor.success ? cursor.data : null,
    BROWSE_PAGE_SIZE,
  );
  return {
    total: page.total,
    photos: page.photos.map((photo) => toClientPhotoView(photo, client.token, deps.directImages)),
    nextCursor: page.nextCursor,
  };
}
