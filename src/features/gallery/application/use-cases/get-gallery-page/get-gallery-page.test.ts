import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import {
  BOOKED_PROJECT_ID,
  fixtureGalleries,
  OTHER_WORKSPACE,
  OWNER_ID,
  WORKSPACE,
} from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it } from "vitest";

import {
  createGalleryForBooking,
  prepareGalleryPassword,
} from "../create-gallery-for-booking/create-gallery-for-booking";
import { getGalleryPage } from "./get-gallery-page";

const NOW = new Date("2026-10-04T03:00:00Z");

async function withGallery() {
  const galleries = fixtureGalleries();
  const prepared = await prepareGalleryPassword(
    {
      cipher: fakeCipher,
      hasher: fakeHasher,
      passwords: { propose: () => "mawar-4821" },
      newId: () => "g-1",
    },
    WORKSPACE,
  );
  await createGalleryForBooking({ galleries }, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, prepared);
  return galleries;
}

describe("getGalleryPage", () => {
  it("AC-GAL-027 shows the Owner the password, the header facts and no sources yet", async () => {
    const page = await getGalleryPage(
      await withGallery(),
      new FakeWorkspaceSourceRepository(),
      fakeCipher,
      WORKSPACE,
      BOOKED_PROJECT_ID,
      NOW,
    );
    expect(page.project.title).toBe("Wisuda Rina");
    expect(page.gallery).toMatchObject({ state: "OPEN", password: "mawar-4821" });
    expect(page.sources).toEqual([]);
  });

  it("AC-GAL-027 gives another workspace's Owner not found", async () => {
    await expect(
      getGalleryPage(
        await withGallery(),
        new FakeWorkspaceSourceRepository(),
        fakeCipher,
        OTHER_WORKSPACE,
        BOOKED_PROJECT_ID,
        NOW,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns not found for a project without a gallery", async () => {
    await expect(
      getGalleryPage(
        fixtureGalleries(),
        new FakeWorkspaceSourceRepository(),
        fakeCipher,
        WORKSPACE,
        BOOKED_PROJECT_ID,
        NOW,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
