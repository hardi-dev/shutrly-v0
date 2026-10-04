import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { archiveGallery } from "./archive-gallery";

describe("archiveGallery", () => {
  it("AC-GAL-022 archives a published or expired gallery, with no way back", async () => {
    const { deps, sources } = await lifecycleSetup({
      status: "PUBLISHED",
      expiresAt: new Date("2026-10-01T00:00:00Z"),
    });
    expect(await archiveGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({ ok: true });
    expect(sources.galleries.get(GALLERY_ID)).toMatchObject({
      status: "ARCHIVED",
      archivedBy: OWNER_ID,
    });
    expect(await archiveGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
  });

  it("BR-GAL-005 refuses a draft", async () => {
    const { deps } = await lifecycleSetup();
    expect(await archiveGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
  });
});
