import "server-only";

import { isServableToClient } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";

import type {
  ThumbnailResult,
  ThumbnailSize,
} from "../../ports/gallery-source-provider/gallery-source-provider.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ServeClientPhotoDeps } from "./serve-client-photo.types";

/** Fetches the image fallback for a signed-in client, only for a photo this client may see (BR-ACC-005, D-15, AC-ACC-013). @param deps - client reader and provider @param client - the signed-in client context @param photoId - the photo id @param size - thumb or preview @returns the image, or not ok for any photo outside the client's view */
export async function serveClientPhoto(
  deps: ServeClientPhotoDeps,
  client: ClientContext,
  photoId: string,
  size: ThumbnailSize,
): Promise<ThumbnailResult> {
  const context = { workspaceId: client.workspaceId };
  const photo = await deps.reader.findClientMediaPhoto(context, client.galleryId, photoId);
  if (!photo) return { ok: false };
  const facts = {
    kind: photo.kind,
    isMissing: photo.missing,
    isSourceRemoved: photo.sourceRemoved,
  };
  if (!isServableToClient(facts, client.finalDeliveryPublished)) return { ok: false };
  return deps.provider.thumbnail(
    { fileId: photo.externalFileId, resourceKey: photo.resourceKey },
    size,
  );
}
