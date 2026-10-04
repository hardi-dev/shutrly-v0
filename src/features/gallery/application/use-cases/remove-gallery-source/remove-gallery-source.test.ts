import { OTHER_WORKSPACE, OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { BOTH_FOLDERS, lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { describe, expect, it } from "vitest";

import { removeGallerySource } from "./remove-gallery-source";

describe("removeGallerySource", () => {
  it("AC-GAL-013 removes one folder of a published gallery but not the last one", async () => {
    const { deps, sources } = await lifecycleSetup({ status: "PUBLISHED" }, BOTH_FOLDERS);
    expect(await removeGallerySource(deps, WORKSPACE, OWNER_ID, "source-2")).toEqual({ ok: true });
    expect(sources.sources.find((row) => row.id === "source-2")?.removed).toBe(true);
    expect(sources.photos.filter((photo) => photo.sourceId === "source-2")).toHaveLength(1);
    expect(await removeGallerySource(deps, WORKSPACE, OWNER_ID, "source-1")).toEqual({
      ok: false,
      code: "LAST_ACTIVE_SOURCE",
    });
  });

  it("A-6 removes the only folder of a draft", async () => {
    const { deps } = await lifecycleSetup();
    expect(await removeGallerySource(deps, WORKSPACE, OWNER_ID, "source-1")).toEqual({ ok: true });
  });

  it("AC-GAL-022 AC-GAL-025 refuses an archived gallery and another workspace", async () => {
    const { deps } = await lifecycleSetup({ status: "ARCHIVED" }, BOTH_FOLDERS);
    expect(await removeGallerySource(deps, WORKSPACE, OWNER_ID, "source-2")).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(
      removeGallerySource(deps, OTHER_WORKSPACE, OWNER_ID, "source-2"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
