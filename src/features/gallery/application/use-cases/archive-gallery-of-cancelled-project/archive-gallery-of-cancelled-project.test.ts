import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { archiveGalleryOfCancelledProject } from "./archive-gallery-of-cancelled-project";

const PROJECT_ID = "project-1";

describe("archiveGalleryOfCancelledProject (removed in F-27 iteration 3)", () => {
  // AC-GFL-016 supersedes AC-GAL-024: cancelling closes the gallery by its derived state and
  // writes nothing, so the cancel transaction archives nothing.
  it("AC-GFL-016 leaves the gallery unwritten when its project is cancelled", async () => {
    const { deps, sources } = await lifecycleSetup({ projectStatus: "CANCELLED" });
    sources.galleryByProject.set(PROJECT_ID, GALLERY_ID);
    expect(await archiveGalleryOfCancelledProject(deps, WORKSPACE, OWNER_ID, PROJECT_ID)).toBe(
      false,
    );
    expect(sources.galleries.get(GALLERY_ID)?.archivedBy).toBeNull();
  });
});
