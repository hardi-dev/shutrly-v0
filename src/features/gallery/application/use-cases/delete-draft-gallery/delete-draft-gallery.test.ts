import { WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { deleteDraftGallery } from "./delete-draft-gallery";

describe("deleteDraftGallery (removed in F-27 iteration 3)", () => {
  // AC-GFL-006 supersedes AC-GAL-023: there are no drafts and no gallery deletion.
  it("AC-GFL-006 refuses to delete a gallery and keeps it", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(await deleteDraftGallery(deps, WORKSPACE, GALLERY_ID)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    expect(sources.galleries.get(GALLERY_ID)?.deleted).toBe(false);
  });
});
