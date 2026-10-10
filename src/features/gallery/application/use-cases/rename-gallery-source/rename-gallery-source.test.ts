import { OTHER_WORKSPACE, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { describe, expect, it } from "vitest";

import { renameGallerySource } from "./rename-gallery-source";

describe("renameGallerySource", () => {
  it("AC-GAL-037 sets a trimmed label and clears it back to the folder name", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(
      await renameGallerySource(deps, WORKSPACE, "source-1", { label: "  Softball " }),
    ).toEqual({ ok: true });
    expect(sources.sources[0]?.label).toBe("Softball");
    expect(await renameGallerySource(deps, WORKSPACE, "source-1", { label: "" })).toEqual({
      ok: true,
    });
    expect(sources.sources[0]?.label).toBeNull();
  });

  it("AC-GAL-037 refuses a name over 60 characters and changes nothing", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(
      await renameGallerySource(deps, WORKSPACE, "source-1", { label: "x".repeat(61) }),
    ).toEqual({ ok: false, code: "VALIDATION_FAILED", fieldErrors: { label: "TOO_LONG" } });
    expect(sources.sources[0]?.label).toBeNull();
  });

  it("AC-GAL-022 AC-GAL-025 refuses an archived gallery and another workspace", async () => {
    const { deps } = await lifecycleSetup({ status: "ARCHIVED" });
    expect(await renameGallerySource(deps, WORKSPACE, "source-1", { label: "Softball" })).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(
      renameGallerySource(deps, OTHER_WORKSPACE, "source-1", { label: "Softball" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
