import { RINA_FOLDER_ID, SECOND_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { DRIVE_SOURCE_ID, GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";

import type { LockedGalleryState } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";

/** A gallery in the given state with *Rina-Wisuda* (and optionally a second folder) linked and synced. */
export async function lifecycleSetup(
  gallery: Partial<LockedGalleryState> = {},
  folders = [RINA_FOLDER_ID],
) {
  const setup = sourceSetup();
  for (const folderId of folders) {
    await linkGallerySource(setup.deps, WORKSPACE, OWNER_ID, GALLERY_ID, {
      workspaceSourceId: DRIVE_SOURCE_ID,
      link: `https://drive.google.com/drive/folders/${folderId}`,
      label: "",
    });
  }
  const current = setup.sources.galleries.get(GALLERY_ID);
  if (current) setup.sources.galleries.set(GALLERY_ID, { ...current, ...gallery });
  return setup;
}

export const BOTH_FOLDERS = [RINA_FOLDER_ID, SECOND_FOLDER_ID];
