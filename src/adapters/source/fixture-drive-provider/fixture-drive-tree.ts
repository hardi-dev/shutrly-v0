import "server-only";

import { DRIVE_FOLDER_MIME } from "@/features/gallery/domain/sync-plan/sync-plan";
import type { FolderEntry } from "@/features/gallery/domain/sync-plan/sync-plan.types";

// Data file: the AC fixture folders served when E2E_FAKE_DRIVE=1 (TD › Testing Strategy).
export const FIXTURE_NOT_PUBLIC_ID = "fixtureNotPublic01";

interface FixtureFolder {
  readonly name: string;
  readonly entries: readonly FolderEntry[];
}

const folder = (id: string, name: string): FolderEntry => ({
  id,
  name,
  mimeType: DRIVE_FOLDER_MIME,
  resourceKey: null,
});
const image = (name: string): FolderEntry => ({
  id: `fixture-${name}`,
  name,
  mimeType: "image/jpeg",
  resourceKey: null,
});
const other = (name: string, mimeType: string): FolderEntry => ({
  id: `fixture-${name}`,
  name,
  mimeType,
  resourceKey: null,
});

export const FIXTURE_FOLDERS: Readonly<Record<string, FixtureFolder>> = {
  fixtureRinaWisuda01: {
    name: "Rina-Wisuda",
    entries: [
      image("IMG_001.jpg"),
      image("IMG_002.jpg"),
      image("IMG_010.jpg"),
      other("notes.pdf", "application/pdf"),
      other("clip.mp4", "video/mp4"),
      folder("fixtureRinaEdited01", "Edited"),
      folder("fixtureRinaPrint001", "print"),
      folder("fixtureRinaRaw00001", "raw"),
    ],
  },
  fixtureRinaEdited01: {
    name: "Edited",
    entries: [image("E_001.jpg"), image("E_002.jpg"), folder("fixtureRinaOld00001", "old")],
  },
  fixtureRinaPrint001: { name: "print", entries: [image("P_001.jpg")] },
  fixtureRinaRaw00001: { name: "raw", entries: [image("R_001.jpg")] },
  fixtureRinaOld00001: { name: "old", entries: [image("X_001.jpg")] },
  fixtureSecond00001: { name: "Rina-Keluarga", entries: [image("IMG_003.jpg")] },
};

/** Finds a fixture folder by its ID. @param folderId - the Drive folder ID @returns the folder, or undefined for an unknown (unshared) one */
export function fixtureFolder(folderId: string): FixtureFolder | undefined {
  return Object.entries(FIXTURE_FOLDERS).find(([id]) => id === folderId)?.[1];
}
