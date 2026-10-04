import { imageEntry, RINA_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { OTHER_WORKSPACE, OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { DRIVE_SOURCE_ID, GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { linkGallerySource } from "../link-gallery-source/link-gallery-source";
import { syncGallerySource } from "./sync-gallery-source";

const VALUES = {
  workspaceSourceId: DRIVE_SOURCE_ID,
  link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
  label: "",
};

async function linked() {
  const setup = sourceSetup();
  await linkGallerySource(setup.deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES);
  return setup;
}

describe("syncGallerySource", () => {
  it("AC-GAL-006 re-syncing never duplicates", async () => {
    const { deps, sources } = await linked();
    await syncGallerySource(deps, WORKSPACE, "source-1");
    await syncGallerySource(deps, WORKSPACE, "source-1");
    expect(sources.photos).toHaveLength(8);
  });

  it("AC-GAL-007 marks a removed file missing and clears it when it returns", async () => {
    const { deps, sources, provider } = await linked();
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(RINA_FOLDER_ID, [
      ...root.filter((entry) => entry.name !== "IMG_002.jpg"),
      imageEntry("IMG_011.jpg"),
    ]);
    await syncGallerySource(deps, WORKSPACE, "source-1");
    expect(sources.photos.find((photo) => photo.fileName === "IMG_002.jpg")?.missing).toBe(true);
    expect(sources.photos.find((photo) => photo.fileName === "IMG_011.jpg")?.kind).toBe("PROOF");
    provider.tree.set(RINA_FOLDER_ID, root);
    await syncGallerySource(deps, WORKSPACE, "source-1");
    expect(sources.photos.find((photo) => photo.fileName === "IMG_002.jpg")?.missing).toBe(false);
  });

  it("AC-GAL-006 refuses a second sync while one runs", async () => {
    const { deps, sources } = await linked();
    sources.sources[0].syncStatus = "SYNCING";
    expect(await syncGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "SYNC_IN_PROGRESS",
    });
  });

  it("D-19 refuses past the workspace sync rate limit", async () => {
    const { deps, rateLimiter } = await linked();
    rateLimiter.hit.mockResolvedValueOnce(false);
    expect(await syncGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
    expect(rateLimiter.hit).toHaveBeenLastCalledWith(`gallery-sync:${WORKSPACE.workspaceId}`, {
      limit: 20,
      windowSeconds: 60,
    });
  });

  it("AC-GAL-008 a provider failure keeps the earlier photos", async () => {
    const { deps, sources, provider } = await linked();
    provider.failures.set(RINA_FOLDER_ID, "UNAVAILABLE");
    expect(await syncGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: true,
      status: "FAILED",
      errorCode: "UNAVAILABLE",
    });
    expect(sources.photos).toHaveLength(8);
    expect(sources.sources[0]).toMatchObject({
      syncStatus: "FAILED",
      syncErrorCode: "UNAVAILABLE",
    });
  });

  it("AC-GAL-013 refuses a removed source and AC-GAL-025 another workspace", async () => {
    const { deps, sources } = await linked();
    sources.sources[0].removed = true;
    expect(await syncGallerySource(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(syncGallerySource(deps, OTHER_WORKSPACE, "source-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
