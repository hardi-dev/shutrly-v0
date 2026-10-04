import { WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { findFolderUse } from "./find-folder-use";

describe("findFolderUse", () => {
  it("AC-GAL-010 names the other project that links the folder", async () => {
    const { sources } = sourceSetup();
    sources.otherProjectFolders.set("1SharedAlbumFolder", ["Prewed Sari"]);
    const link = "https://drive.google.com/drive/folders/1SharedAlbumFolder";
    expect(await findFolderUse(sources, WORKSPACE, GALLERY_ID, link)).toEqual({
      ok: true,
      projectTitles: ["Prewed Sari"],
    });
  });

  it("AC-GAL-009 returns the link's field error", async () => {
    const { sources } = sourceSetup();
    expect(await findFolderUse(sources, WORKSPACE, GALLERY_ID, "https://example.com")).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { link: "NOT_DRIVE" },
    });
  });
});
