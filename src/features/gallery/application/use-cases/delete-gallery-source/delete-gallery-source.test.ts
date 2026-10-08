import { OTHER_WORKSPACE, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { BOTH_FOLDERS, lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { describe, expect, it } from "vitest";

import { deleteGallerySource } from "./delete-gallery-source";

describe("deleteGallerySource", () => {
  it("AC-GAL-013 deletes one folder of a published gallery with its photos, but not the last one", async () => {
    const { deps, sources } = await lifecycleSetup({ status: "PUBLISHED" }, BOTH_FOLDERS);
    expect(await deleteGallerySource(deps, WORKSPACE, "source-2")).toEqual({ ok: true });
    expect(sources.sources.map((row) => row.id)).toEqual(["source-1"]);
    expect(sources.photos.filter((photo) => photo.sourceId === "source-2")).toHaveLength(0);
    expect(await deleteGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "LAST_ACTIVE_SOURCE",
    });
  });

  it("AC-GAL-013 BR-GAL-009 refuses a folder with a client pick and deletes nothing", async () => {
    const { deps, sources } = await lifecycleSetup({}, BOTH_FOLDERS);
    sources.pickedSources.add("source-2");
    expect(await deleteGallerySource(deps, WORKSPACE, "source-2")).toEqual({
      ok: false,
      code: "HAS_PICKS",
    });
    expect(sources.sources).toHaveLength(2);
    expect(sources.photos.some((photo) => photo.sourceId === "source-2")).toBe(true);
  });

  it("A-6 deletes the only folder of a draft", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(await deleteGallerySource(deps, WORKSPACE, "source-1")).toEqual({ ok: true });
    expect(sources.photos).toHaveLength(0);
  });

  it("AC-GAL-022 AC-GAL-025 refuses an archived gallery and another workspace", async () => {
    const { deps } = await lifecycleSetup({ status: "ARCHIVED" }, BOTH_FOLDERS);
    expect(await deleteGallerySource(deps, WORKSPACE, "source-2")).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(deleteGallerySource(deps, OTHER_WORKSPACE, "source-2")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
