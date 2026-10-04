import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import {
  BOOKED_PROJECT_ID,
  fixtureGalleries,
  OTHER_WORKSPACE,
  OWNER_ID,
  WORKSPACE,
} from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it } from "vitest";

import { createGallery } from "../create-gallery/create-gallery";
import { getGalleryPage } from "./get-gallery-page";

const NOW = new Date("2026-10-04T03:00:00Z");

async function withGallery() {
  const galleries = fixtureGalleries();
  const deps = { galleries, cipher: fakeCipher, hasher: fakeHasher, newId: () => "g-1", now: NOW };
  await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, {
    password: "mawar-4821",
    expiry: { type: "NONE" },
  });
  return galleries;
}

describe("getGalleryPage", () => {
  it("AC-GAL-027 shows the Owner the password, the header facts and no sources yet", async () => {
    const page = await getGalleryPage(
      await withGallery(),
      fakeCipher,
      WORKSPACE,
      BOOKED_PROJECT_ID,
      NOW,
    );
    expect(page.project.title).toBe("Wisuda Rina");
    expect(page.gallery).toMatchObject({ status: "DRAFT", password: "mawar-4821" });
    expect(page.sources).toEqual([]);
  });

  it("AC-GAL-027 gives another workspace's Owner not found", async () => {
    await expect(
      getGalleryPage(await withGallery(), fakeCipher, OTHER_WORKSPACE, BOOKED_PROJECT_ID, NOW),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns not found for a project without a gallery", async () => {
    await expect(
      getGalleryPage(fixtureGalleries(), fakeCipher, WORKSPACE, BOOKED_PROJECT_ID, NOW),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
