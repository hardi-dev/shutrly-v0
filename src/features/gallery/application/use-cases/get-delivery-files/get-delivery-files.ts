import "server-only";

import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type {
  DeliveryFilesView,
  DeliveryFileView,
  GetDeliveryFilesDeps,
} from "./get-delivery-files.types";

// Names for finished files synced before F-20 had items.
const FALLBACK = { EDITED: "Edited", PRINT: "Print" } as const;

/**
 * Loads *Hasil akhir* for the signed-in client: every visible, not-missing EDITED and PRINT file
 * with its image and download URLs, grouped per package item with every selection item shown even when
 * empty (F-20, Owner 2026-10-08), or null before final delivery is published (BR-DEL-001/002,
 * BR-DEL-004, D-15, D-18, AC-DEL-003, -004, -006).
 * @param deps - the client reader and whether images load straight from Google
 * @param client - the signed-in client context
 * @returns the files per item, or null before delivery
 */
export async function getDeliveryFiles(
  deps: GetDeliveryFilesDeps,
  client: ClientContext,
): Promise<DeliveryFilesView | null> {
  if (!client.finalDeliveryPublished) return null;
  const context = { workspaceId: client.workspaceId };
  const [items, photos] = await Promise.all([
    deps.reader.listDeliveryItems(context, client.galleryId),
    deps.reader.listFinishedPhotos(context, client.galleryId),
  ]);
  const groups = new Map<string, { id: string; name: string; files: DeliveryFileView[] }>(
    items.map((item) => [item.id, { id: item.id, name: item.name, files: [] }]),
  );
  for (const photo of photos) {
    // F-20: one tab per package item; older files without an item fall back to their kind.
    const id = photo.itemId ?? photo.kind;
    const name = photo.itemName ?? (photo.kind === "EDITED" ? FALLBACK.EDITED : FALLBACK.PRINT);
    const group = groups.get(id) ?? { id, name, files: [] };
    group.files.push({
      ...toClientPhotoView(photo, client.token, deps.directImages),
      downloadUrl: `/g/${client.token}/download/${photo.id}`,
    });
    groups.set(id, group);
  }
  return { groups: [...groups.values()] };
}
