import { WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { deleteDraftGallery } from "./delete-draft-gallery";

describe("deleteDraftGallery", () => {
  it("AC-GAL-023 deletes a draft, also on a cancelled project", async () => {
    const { deps, sources } = await lifecycleSetup({ projectStatus: "CANCELLED" });
    expect(await deleteDraftGallery(deps, WORKSPACE, GALLERY_ID)).toEqual({ ok: true });
    expect(sources.galleries.get(GALLERY_ID)?.deleted).toBe(true);
  });

  it("AC-GAL-023 refuses a gallery that is or was published", async () => {
    for (const status of ["PUBLISHED", "ARCHIVED"] as const) {
      const { deps } = await lifecycleSetup({ status });
      expect(await deleteDraftGallery(deps, WORKSPACE, GALLERY_ID)).toEqual({
        ok: false,
        code: "INVALID_STATE",
      });
    }
  });
});
