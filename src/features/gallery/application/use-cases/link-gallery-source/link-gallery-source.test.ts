import { RINA_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { OTHER_WORKSPACE, OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { DRIVE_SOURCE_ID, GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { linkGallerySource } from "./link-gallery-source";

const LINK = `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}?usp=sharing`;
const VALUES = { workspaceSourceId: DRIVE_SOURCE_ID, link: LINK, label: "" };

describe("linkGallerySource", () => {
  it("AC-GAL-005 D-27 links the folder as a source that has not synced yet", async () => {
    const { deps, sources } = sourceSetup();
    const result = await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES);
    expect(result).toEqual({ ok: true, sourceId: "source-1" });
    expect(sources.photos).toHaveLength(0);
    expect(sources.sources[0]).toMatchObject({ syncStatus: "NEVER", label: null });
  });

  it("AC-GAL-009 refuses a file link or a non-Drive link with a field error", async () => {
    const { deps, sources } = sourceSetup();
    for (const [link, code] of [
      [`https://drive.google.com/file/d/${RINA_FOLDER_ID}/view`, "NOT_A_FOLDER"],
      ["https://example.com", "NOT_DRIVE"],
    ]) {
      expect(
        await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, { ...VALUES, link }),
      ).toEqual({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { link: code },
      });
    }
    expect(sources.sources).toHaveLength(0);
  });

  it("AC-GAL-010 refuses the same folder twice in one gallery", async () => {
    const { deps } = sourceSetup();
    await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES);
    expect(await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { link: "FOLDER_ALREADY_LINKED" },
    });
  });

  it("AC-GAL-011 offers only active workspace sources for new links", async () => {
    const { deps, sources } = sourceSetup();
    sources.activeWorkspaceSources.clear();
    expect(await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES)).toMatchObject({
      fieldErrors: { workspaceSourceId: "SOURCE_NOT_ACTIVE" },
    });
  });

  it("AC-GAL-022 AC-GAL-024 refuses on an archived gallery or a cancelled project", async () => {
    for (const state of [
      { status: "ARCHIVED" as const },
      { projectStatus: "CANCELLED" as const },
    ]) {
      const { deps } = sourceSetup(state);
      expect(await linkGallerySource(deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES)).toEqual({
        ok: false,
        code: "INVALID_STATE",
      });
    }
  });

  it("AC-GAL-025 treats another workspace's gallery as not found", async () => {
    const { deps } = sourceSetup();
    await expect(
      linkGallerySource(deps, OTHER_WORKSPACE, OWNER_ID, GALLERY_ID, VALUES),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
