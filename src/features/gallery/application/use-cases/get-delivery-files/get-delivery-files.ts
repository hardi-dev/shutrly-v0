import "server-only";

import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { DeliveryFilesView, GetDeliveryFilesDeps } from "./get-delivery-files.types";

/**
 * Loads *Hasil akhir* for the signed-in client: every visible, not-missing EDITED and PRINT file
 * with its image and download URLs, or null before final delivery is published (BR-DEL-001/002,
 * BR-DEL-004, D-15, D-18, AC-DEL-003, -004, -006).
 * @param deps - the client reader and whether images load straight from Google
 * @param client - the signed-in client context
 * @returns the files by kind, or null before delivery
 */
export async function getDeliveryFiles(
  deps: GetDeliveryFilesDeps,
  client: ClientContext,
): Promise<DeliveryFilesView | null> {
  if (!client.finalDeliveryPublished) return null;
  const context = { workspaceId: client.workspaceId };
  const photos = await deps.reader.listFinishedPhotos(context, client.galleryId);
  const view = (kind: "EDITED" | "PRINT") =>
    photos
      .filter((photo) => photo.kind === kind)
      .map((photo) => ({
        ...toClientPhotoView(photo, client.token, deps.directImages),
        downloadUrl: `/g/${client.token}/unduh/${photo.id}`,
      }));
  return { edited: view("EDITED"), print: view("PRINT") };
}
