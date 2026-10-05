import { FakeDriveProvider } from "@tests/support/gallery/fake-drive-provider";
import {
  fixtureGalleries,
  OTHER_WORKSPACE,
  WORKSPACE,
} from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it } from "vitest";

import { serveOwnerPhoto } from "./serve-owner-photo";

function setup(missing = false) {
  const galleries = fixtureGalleries();
  galleries.photos.push({
    id: "photo-1",
    galleryId: "g-1",
    workspaceId: WORKSPACE.workspaceId,
    fileName: "IMG_001.jpg",
    kind: "PROOF",
    folderPath: "",
    browsePath: "",
    sourceId: "s-1",
    sourceName: "Rina-Wisuda",
    externalFileId: "file-IMG_001.jpg",
    provider: "GOOGLE_DRIVE",
    resourceKey: null,
    missing,
  });
  return { galleries, provider: new FakeDriveProvider() };
}

describe("serveOwnerPhoto", () => {
  it("AC-GAL-015 returns the image through the provider", async () => {
    const result = await serveOwnerPhoto(setup(), WORKSPACE, "photo-1", "thumb");
    expect(result).toMatchObject({ ok: true, contentType: "image/jpeg" });
  });

  it("AC-GAL-025 returns nothing for another workspace", async () => {
    expect(await serveOwnerPhoto(setup(), OTHER_WORKSPACE, "photo-1", "thumb")).toEqual({
      ok: false,
    });
  });

  it("AC-GAL-031 returns nothing for a missing file", async () => {
    expect(await serveOwnerPhoto(setup(true), WORKSPACE, "photo-1", "preview")).toEqual({
      ok: false,
    });
  });
});
