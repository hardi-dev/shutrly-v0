import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { publishGallery } from "./publish-gallery";

describe("publishGallery (removed in F-27 iteration 3)", () => {
  // AC-GFL-006 supersedes AC-GAL-016…018: a gallery opens with its project, nothing is published.
  it("AC-GFL-006 refuses to publish a gallery that has a synced folder", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    expect(sources.selectionGroupCalls).toBe(0);
  });
});
