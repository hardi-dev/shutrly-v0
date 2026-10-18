import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { archiveGallery } from "./archive-gallery";

describe("archiveGallery (removed in F-27 iteration 3)", () => {
  // AC-GFL-006 supersedes AC-GAL-022: there is no archive, so nothing is written.
  it("AC-GFL-006 refuses to archive an open gallery and writes nothing", async () => {
    const { deps, sources } = await lifecycleSetup({
      expiresAt: new Date("2026-10-01T00:00:00Z"),
    });
    expect(await archiveGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    expect(sources.galleries.get(GALLERY_ID)?.archivedBy).toBeNull();
  });
});
