import { RINA_FOLDER_ID, SECOND_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { DRIVE_SOURCE_ID, GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";

import type { LockedGalleryState } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";

/** A gallery in the given state with *Rina-Wisuda* (and optionally a second folder) linked and synced. */
export async function lifecycleSetup(
  gallery: Partial<LockedGalleryState> = {},
  folders = [RINA_FOLDER_ID],
) {
  const setup = sourceSetup();
  for (const folderId of folders) {
    const linked = await linkGallerySource(setup.deps, WORKSPACE, OWNER_ID, GALLERY_ID, {
      workspaceSourceId: DRIVE_SOURCE_ID,
      link: `https://drive.google.com/drive/folders/${folderId}`,
      label: "",
    });
    if (!linked.ok) throw new Error("link failed");
    // Linking no longer syncs (D-27), so the fixture runs the sync steps the browser would.
    for (let step = 0; step < 50; step += 1) {
      const outcome = await syncGallerySourceStep(setup.deps, WORKSPACE, linked.sourceId);
      if (!outcome.ok || outcome.status !== "CONTINUE") break;
    }
  }
  const current = setup.sources.galleries.get(GALLERY_ID);
  if (current) setup.sources.galleries.set(GALLERY_ID, { ...current, ...gallery });
  return setup;
}

export const BOTH_FOLDERS = [RINA_FOLDER_ID, SECOND_FOLDER_ID];
