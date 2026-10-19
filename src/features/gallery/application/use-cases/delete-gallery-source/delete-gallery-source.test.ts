import { OTHER_WORKSPACE, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { BOTH_FOLDERS, lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { describe, expect, it } from "vitest";

import { deleteGallerySource } from "./delete-gallery-source";

describe("deleteGallerySource", () => {
  it("AC-GAL-013 deletes one folder of an open gallery with its photos", async () => {
    const { deps, sources } = await lifecycleSetup({}, BOTH_FOLDERS);
    expect(await deleteGallerySource(deps, WORKSPACE, "source-2")).toEqual({ ok: true });
    expect(sources.sources.map((row) => row.id)).toEqual(["source-1"]);
    expect(sources.photos.filter((photo) => photo.sourceId === "source-2")).toHaveLength(0);
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

  it("AC-GFL-015 removes the last folder of an open gallery when no photo is picked", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(await deleteGallerySource(deps, WORKSPACE, "source-1")).toEqual({ ok: true });
    expect(sources.sources.map((row) => row.id)).not.toContain("source-1");
    expect(sources.photos.some((photo) => photo.sourceId === "source-1")).toBe(false);
  });

  it("AC-GFL-015 refuses the last folder when a client picked one of its photos", async () => {
    const { deps, sources } = await lifecycleSetup();
    sources.pickedSources.add("source-1");
    expect(await deleteGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "HAS_PICKS",
    });
    expect(sources.photos.length).toBeGreaterThan(0);
  });

  it("AC-GFL-016 AC-GAL-025 refuses a cancelled project's gallery and another workspace", async () => {
    const { deps } = await lifecycleSetup({ projectStatus: "CANCELLED" }, BOTH_FOLDERS);
    expect(await deleteGallerySource(deps, WORKSPACE, "source-2")).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(deleteGallerySource(deps, OTHER_WORKSPACE, "source-2")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
