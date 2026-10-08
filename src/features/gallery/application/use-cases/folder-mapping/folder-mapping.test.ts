import { OTHER_WORKSPACE, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { describe, expect, it } from "vitest";

import { getFolderMapping, setFolderMapping } from "./folder-mapping";

const EDIT = "00000000-0000-4000-8000-0000000000e1";
const PRINT = "00000000-0000-4000-8000-0000000000a1";

async function setup() {
  const ctx = await lifecycleSetup();
  ctx.sources.mappableItems = [
    { id: EDIT, name: "Foto edit", pickMode: "COUNT" },
    { id: PRINT, name: "Foto cetak", pickMode: "QUANTITY" },
  ];
  return ctx;
}

const kinds = (photos: readonly { kind: string }[], kind: string) =>
  photos.filter((photo) => photo.kind === kind).length;

describe("folder mapping (F-21)", () => {
  it("F-21 shows the subfolders found by the sync and the project's selection items", async () => {
    const { deps } = await setup();
    const view = await getFolderMapping(deps, WORKSPACE, "source-1");
    expect(view.folders).toEqual(["Edited", "Edited/old", "print", "raw"]);
    expect(view.items.map((item) => item.name)).toEqual(["Foto edit", "Foto cetak"]);
    expect(view.mappings).toEqual([]);
  });

  it("F-21 saving a mapping reclassifies the stored photos at once, unmapped folders become proofs", async () => {
    const { deps, sources } = await setup();
    expect(
      await setFolderMapping(deps, WORKSPACE, "source-1", {
        mappings: [{ path: "raw", projectItemId: PRINT }],
      }),
    ).toEqual({ ok: true });
    expect(kinds(sources.photos, "PRINT")).toBe(1);
    expect(kinds(sources.photos, "EDITED")).toBe(0);
    expect(sources.photos.find((photo) => photo.fileName === "R_001.jpg")).toMatchObject({
      kind: "PRINT",
      projectItemId: PRINT,
    });
    expect((await getFolderMapping(deps, WORKSPACE, "source-1")).mappings).toEqual([
      { path: "raw", projectItemId: PRINT },
    ]);
  });

  it("F-21 refuses an item that isn't a selection item of this project, or one path twice", async () => {
    const { deps, sources } = await setup();
    const other = "00000000-0000-4000-8000-0000000000ff";
    for (const mappings of [
      [{ path: "raw", projectItemId: other }],
      [
        { path: "raw", projectItemId: EDIT },
        { path: "raw", projectItemId: PRINT },
      ],
    ]) {
      expect(await setFolderMapping(deps, WORKSPACE, "source-1", { mappings })).toEqual({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { mappings: "INVALID" },
      });
    }
    expect(sources.savedMappings.size).toBe(0);
  });

  it("AC-GAL-022 AC-GAL-025 refuses an archived gallery and another workspace", async () => {
    const archived = await lifecycleSetup({ status: "ARCHIVED" });
    archived.sources.mappableItems = [{ id: EDIT, name: "Foto edit", pickMode: "COUNT" }];
    expect(
      await setFolderMapping(archived.deps, WORKSPACE, "source-1", {
        mappings: [{ path: "raw", projectItemId: EDIT }],
      }),
    ).toEqual({ ok: false, code: "INVALID_STATE" });
    const { deps } = await setup();
    await expect(getFolderMapping(deps, OTHER_WORKSPACE, "source-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
