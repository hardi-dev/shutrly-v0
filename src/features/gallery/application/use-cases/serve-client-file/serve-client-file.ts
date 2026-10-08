import "server-only";

import { isServableToClient } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";

import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ServeClientFileDeps, ServeClientFileResult } from "./serve-client-file.types";

const NOTHING: ServeClientFileResult = { ok: false };

/**
 * Streams one original file to the signed-in client: a visible proof of this gallery at any time
 * (F-20, Owner 2026-10-07), or a visible EDITED or PRINT file once final delivery is published
 * (BR-DEL-002, BR-DEL-004, BR-ACC-005, D-18, AC-DEL-003…005).
 * @param deps - the client reader and the provider
 * @param client - the signed-in client context
 * @param photoId - the photo id
 * @returns the stream with its name and type, or not ok for anything else
 */
export async function serveClientFile(
  deps: ServeClientFileDeps,
  client: ClientContext,
  photoId: string,
): Promise<ServeClientFileResult> {
  const context = { workspaceId: client.workspaceId };
  const photo = await deps.reader.findClientMediaPhoto(context, client.galleryId, photoId);
  if (!photo) return NOTHING;
  const facts = {
    kind: photo.kind,
    isMissing: photo.missing,
    isSourceRemoved: photo.sourceRemoved,
  };
  if (!isServableToClient(facts, client.finalDeliveryPublished)) return NOTHING;
  const file = await deps.provider.download({
    fileId: photo.externalFileId,
    resourceKey: photo.resourceKey,
  });
  return file.ok ? { ...file, fileName: photo.fileName } : NOTHING;
}
