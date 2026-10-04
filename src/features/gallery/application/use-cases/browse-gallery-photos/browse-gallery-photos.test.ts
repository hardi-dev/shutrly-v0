import { OTHER_WORKSPACE, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it, vi } from "vitest";

import type { GalleryBrowseReaderPort } from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import { browseGalleryPhotos } from "./browse-gallery-photos";

const SOURCE_A = "77777777-7777-4777-8777-777777777777";

function reader(sources: number): GalleryBrowseReaderPort {
  const list = Array.from({ length: sources }, (_, index) => ({
    sourceId: `s-${String(index)}`,
    name: `Folder ${String(index)}`,
    count: 3,
  }));
  return {
    galleryExists: (context) => Promise.resolve(context.workspaceId === WORKSPACE.workspaceId),
    kindTotals: () => Promise.resolve({ proof: 6, edited: 0, print: 0 }),
    sourceFolders: () => Promise.resolve(list),
    activeSources: () => Promise.resolve(list),
    childFolders: () => Promise.resolve([{ name: "Akad", count: 1 }]),
    folderTotal: () => Promise.resolve(3),
    folderPhotos: vi.fn(() => Promise.resolve({ photos: [], nextCursor: null })),
    searchPhotos: () => Promise.resolve({ photos: [], nextCursor: null, total: 0 }),
  };
}

const QUERY = { kind: "PROOF", sourceId: null, path: "", search: "", cursor: null };

describe("browseGalleryPhotos", () => {
  it("AC-GAL-028 shows one tile per source when there are several", async () => {
    const page = await browseGalleryPhotos(reader(2), WORKSPACE, "g-1", QUERY);
    expect(page).toMatchObject({ mode: "SOURCES", isSingleSource: false });
    expect(page.folders).toHaveLength(2);
  });

  it("AC-GAL-028 opens a single source directly", async () => {
    const page = await browseGalleryPhotos(reader(1), WORKSPACE, "g-1", QUERY);
    expect(page).toMatchObject({ mode: "FOLDER", isSingleSource: true, sourceId: "s-0" });
    expect(page.folders).toEqual([{ name: "Akad", count: 1, sourceId: "s-0", path: "Akad" }]);
    expect(page.summary).toEqual({ folderCount: 1, photoCount: 3 });
  });

  it("AC-GAL-030 opens a subfolder path", async () => {
    const page = await browseGalleryPhotos(reader(2), WORKSPACE, "g-1", {
      ...QUERY,
      sourceId: SOURCE_A,
      path: "Akad",
    });
    expect(page.folders[0].path).toBe("Akad/Akad");
  });

  it("AC-GAL-029 searches across the gallery", async () => {
    const page = await browseGalleryPhotos(reader(2), WORKSPACE, "g-1", {
      ...QUERY,
      search: " IMG_02 ",
    });
    expect(page).toMatchObject({ mode: "SEARCH", summary: { photoCount: 0 } });
  });

  it("AC-GAL-025 refuses another workspace or a bad query", async () => {
    await expect(
      browseGalleryPhotos(reader(1), OTHER_WORKSPACE, "g-1", QUERY),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      browseGalleryPhotos(reader(1), WORKSPACE, "g-1", { ...QUERY, kind: "RAW" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
