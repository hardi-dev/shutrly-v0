import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { archiveGalleryOfCancelledProject } from "./archive-gallery-of-cancelled-project";

const PROJECT_ID = "project-1";

async function setup(state: Parameters<typeof lifecycleSetup>[0]) {
  const result = await lifecycleSetup({ projectStatus: "CANCELLED", ...state });
  result.sources.galleryByProject.set(PROJECT_ID, GALLERY_ID);
  return result;
}

describe("archiveGalleryOfCancelledProject", () => {
  it("AC-GAL-024 archives a published gallery with the actor", async () => {
    const { deps, sources } = await setup({ status: "PUBLISHED" });
    expect(await archiveGalleryOfCancelledProject(deps, WORKSPACE, OWNER_ID, PROJECT_ID)).toBe(
      true,
    );
    expect(sources.galleries.get(GALLERY_ID)).toMatchObject({
      status: "ARCHIVED",
      archivedBy: OWNER_ID,
    });
  });

  it("AC-GAL-024 archives an expired gallery too", async () => {
    const { deps, sources } = await setup({
      status: "PUBLISHED",
      expiresAt: new Date("2026-10-01T00:00:00Z"),
    });
    expect(await archiveGalleryOfCancelledProject(deps, WORKSPACE, OWNER_ID, PROJECT_ID)).toBe(
      true,
    );
    expect(sources.galleries.get(GALLERY_ID)?.status).toBe("ARCHIVED");
  });

  it("A-8 leaves a draft untouched", async () => {
    const { deps, sources } = await setup({ status: "DRAFT" });
    expect(await archiveGalleryOfCancelledProject(deps, WORKSPACE, OWNER_ID, PROJECT_ID)).toBe(
      false,
    );
    expect(sources.galleries.get(GALLERY_ID)?.status).toBe("DRAFT");
  });

  it("does nothing for a project without a gallery", async () => {
    const { deps } = await setup({ status: "PUBLISHED" });
    expect(await archiveGalleryOfCancelledProject(deps, WORKSPACE, OWNER_ID, "other-project")).toBe(
      false,
    );
  });
});
