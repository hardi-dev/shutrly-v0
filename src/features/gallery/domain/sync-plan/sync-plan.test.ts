import { describe, expect, it } from "vitest";

import { DRIVE_FOLDER_MIME, DRIVE_SHORTCUT_MIME, walkFolderTree } from "./sync-plan";
import type { FolderEntry, FolderListing } from "./sync-plan.types";

const ROOT = { folderId: "root-folder-id", resourceKey: null };

function folder(id: string, name: string): FolderEntry {
  return { id, name, mimeType: DRIVE_FOLDER_MIME, resourceKey: null };
}
function file(name: string, mimeType = "image/jpeg"): FolderEntry {
  return { id: `id-${name}`, name, mimeType, resourceKey: null };
}

function lister(tree: Record<string, FolderEntry[]>, pageSize = 100) {
  const calls: string[] = [];
  const list = (ref: { folderId: string }, pageToken: string | null): Promise<FolderListing> => {
    calls.push(ref.folderId);
    const entries = tree[ref.folderId] ?? [];
    const start = pageToken === null ? 0 : Number(pageToken);
    const next = start + pageSize < entries.length ? String(start + pageSize) : null;
    return Promise.resolve({
      ok: true,
      entries: entries.slice(start, start + pageSize),
      nextPageToken: next,
    });
  };
  return { list, calls };
}

// The AC fixture *Rina-Wisuda*.
const RINA: Record<string, FolderEntry[]> = {
  "root-folder-id": [
    file("IMG_001.jpg"),
    file("IMG_002.jpg"),
    file("IMG_010.jpg"),
    file("notes.pdf", "application/pdf"),
    file("clip.mp4", "video/mp4"),
    folder("edited-id", "Edited"),
    folder("print-id", "print"),
    folder("raw-id", "raw"),
  ],
  "edited-id": [file("E_001.jpg"), file("E_002.jpg"), folder("old-id", "old")],
  "print-id": [file("P_001.jpg")],
  "raw-id": [file("R_001.jpg")],
  "old-id": [file("X_001.jpg")],
};

describe("walkFolderTree", () => {
  it("AC-GAL-005 classifies the fixture: 4 proof, 3 edited, 1 print, 2 ignored", async () => {
    const result = await walkFolderTree(lister(RINA).list, ROOT);
    if (!result.ok) throw new Error("walk failed");
    const byKind = (kind: string) =>
      result.photos
        .filter((photo) => photo.kind === kind)
        .map((photo) => `${photo.folderPath}/${photo.fileName}`);
    expect(byKind("PROOF")).toEqual([
      "/IMG_001.jpg",
      "/IMG_002.jpg",
      "/IMG_010.jpg",
      "raw/R_001.jpg",
    ]);
    expect(byKind("EDITED")).toEqual([
      "Edited/E_001.jpg",
      "Edited/E_002.jpg",
      "Edited/old/X_001.jpg",
    ]);
    expect(byKind("PRINT")).toEqual(["print/P_001.jpg"]);
    expect(result.ignoredCount).toBe(2);
    expect(result.tooDeepCount).toBe(0);
  });

  it("AC-GAL-030 folds edited into Akad and skips a folder 6 levels down", async () => {
    const tree: Record<string, FolderEntry[]> = {
      "root-folder-id": [file("IMG_001.jpg"), folder("akad", "Akad"), folder("d1", "1")],
      akad: [file("A_001.jpg"), folder("akad-edited", "edited")],
      "akad-edited": [file("AE_001.jpg")],
      d1: [folder("d2", "2")],
      d2: [folder("d3", "3")],
      d3: [folder("d4", "4")],
      d4: [folder("d5", "5")],
      d5: [folder("d6", "6"), file("deep5.jpg")],
      d6: [file("deep6.jpg")],
    };
    const result = await walkFolderTree(lister(tree).list, ROOT);
    if (!result.ok) throw new Error("walk failed");
    const edited = result.photos.find((photo) => photo.fileName === "AE_001.jpg");
    expect(edited).toMatchObject({ kind: "EDITED", browsePath: "Akad", folderPath: "Akad/edited" });
    expect(result.photos.map((photo) => photo.fileName)).toContain("deep5.jpg");
    expect(result.photos.map((photo) => photo.fileName)).not.toContain("deep6.jpg");
    expect(result.tooDeepCount).toBe(1);
  });

  it("A-14 skips shortcuts without following them", async () => {
    const tree = {
      "root-folder-id": [
        { id: "s", name: "link", mimeType: DRIVE_SHORTCUT_MIME, resourceKey: null },
      ],
    };
    const { list, calls } = lister(tree);
    expect(await walkFolderTree(list, ROOT)).toEqual({
      ok: true,
      photos: [],
      ignoredCount: 0,
      tooDeepCount: 0,
    });
    expect(calls).toEqual(["root-folder-id"]);
  });

  it("D-7 follows page tokens", async () => {
    const tree = {
      "root-folder-id": Array.from({ length: 5 }, (_, i) => file(`P${String(i)}.jpg`)),
    };
    const result = await walkFolderTree(lister(tree, 2).list, ROOT);
    expect(result.ok && result.photos).toHaveLength(5);
  });

  it("R-1 stops with TOO_LARGE past the list-call or photo budget", async () => {
    const tree = {
      "root-folder-id": Array.from({ length: 5 }, (_, i) => file(`P${String(i)}.jpg`)),
    };
    expect(
      await walkFolderTree(lister(tree, 2).list, ROOT, { maxListCalls: 2, maxPhotos: 100 }),
    ).toEqual({
      ok: false,
      code: "TOO_LARGE",
    });
    expect(
      await walkFolderTree(lister(tree).list, ROOT, { maxListCalls: 10, maxPhotos: 4 }),
    ).toEqual({
      ok: false,
      code: "TOO_LARGE",
    });
  });

  it("AC-GAL-008 returns the provider failure", async () => {
    const list = () => Promise.resolve<FolderListing>({ ok: false, code: "NOT_PUBLIC" });
    expect(await walkFolderTree(list, ROOT)).toEqual({ ok: false, code: "NOT_PUBLIC" });
  });
});
