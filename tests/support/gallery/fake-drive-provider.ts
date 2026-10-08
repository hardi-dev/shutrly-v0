import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { DRIVE_FOLDER_MIME } from "@/features/gallery/domain/sync-plan/sync-plan";
import type {
  FolderEntry,
  ProviderFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";

export const RINA_FOLDER_ID = "1RinaWisudaFolder";
export const SECOND_FOLDER_ID = "1RinaKeluargaFolder";

export const folderEntry = (id: string, name: string): FolderEntry => ({
  id,
  name,
  mimeType: DRIVE_FOLDER_MIME,
  resourceKey: null,
});
export const imageEntry = (name: string): FolderEntry => ({
  id: `file-${name}`,
  name,
  mimeType: "image/jpeg",
  resourceKey: null,
});

/** A Drive fake: a mutable folder tree, folder names and per-folder failures. */
export class FakeDriveProvider implements GallerySourceProviderPort {
  readonly tree = new Map<string, FolderEntry[]>();
  readonly names = new Map<string, string>();
  readonly failures = new Map<string, ProviderFailureCode>();
  /** Every `listFolder` call, so a test can count the Drive subrequests of one step. */
  listCalls = 0;

  /** Seeds the AC-GAL-005 fixture *Rina-Wisuda* plus a second folder with `IMG_003.jpg`. */
  static withFixture(): FakeDriveProvider {
    const provider = new FakeDriveProvider();
    provider.names.set(RINA_FOLDER_ID, "Rina-Wisuda");
    provider.names.set(SECOND_FOLDER_ID, "Rina-Keluarga");
    provider.tree.set(RINA_FOLDER_ID, [
      imageEntry("IMG_001.jpg"),
      imageEntry("IMG_002.jpg"),
      imageEntry("IMG_010.jpg"),
      { id: "file-notes", name: "notes.pdf", mimeType: "application/pdf", resourceKey: null },
      { id: "file-clip", name: "clip.mp4", mimeType: "video/mp4", resourceKey: null },
      folderEntry("edited-id", "Edited"),
      folderEntry("print-id", "print"),
      folderEntry("raw-id", "raw"),
    ]);
    provider.tree.set("edited-id", [
      imageEntry("E_001.jpg"),
      imageEntry("E_002.jpg"),
      folderEntry("old-id", "old"),
    ]);
    provider.tree.set("print-id", [imageEntry("P_001.jpg")]);
    provider.tree.set("raw-id", [imageEntry("R_001.jpg")]);
    provider.tree.set("old-id", [imageEntry("X_001.jpg")]);
    provider.tree.set(SECOND_FOLDER_ID, [imageEntry("IMG_003.jpg")]);
    return provider;
  }

  getFolder: GallerySourceProviderPort["getFolder"] = (folder) => {
    const failure = this.failures.get(folder.folderId);
    if (failure) return Promise.resolve({ ok: false, code: failure });
    const name = this.names.get(folder.folderId);
    return Promise.resolve(
      name === undefined ? { ok: false, code: "NOT_PUBLIC" } : { ok: true, name },
    );
  };

  listFolder: GallerySourceProviderPort["listFolder"] = (folder) => {
    this.listCalls += 1;
    const failure = this.failures.get(folder.folderId);
    if (failure) return Promise.resolve({ ok: false, code: failure });
    return Promise.resolve({
      ok: true,
      entries: this.tree.get(folder.folderId) ?? [],
      nextPageToken: null,
    });
  };

  thumbnail: GallerySourceProviderPort["thumbnail"] = (file) =>
    Promise.resolve(
      file.fileId.startsWith("file-")
        ? {
            ok: true,
            body: new Response("jpeg").body ?? new ReadableStream(),
            contentType: "image/jpeg",
          }
        : { ok: false },
    );

  /** File ids whose download fails, like a file deleted from Drive before the next sync (AC-DEL-005). */
  readonly gone = new Set<string>();

  download: GallerySourceProviderPort["download"] = (file) =>
    Promise.resolve(
      file.fileId.startsWith("file-") && !this.gone.has(file.fileId)
        ? {
            ok: true,
            body: new Response(`original:${file.fileId}`).body ?? new ReadableStream(),
            contentType: "image/jpeg",
            contentLength: null,
          }
        : { ok: false },
    );
}
