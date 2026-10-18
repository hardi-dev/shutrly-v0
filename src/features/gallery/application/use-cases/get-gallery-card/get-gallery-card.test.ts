import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import {
  BOOKED_PROJECT_ID,
  CANCELLED_PROJECT_ID,
  DRAFT_PROJECT_ID,
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
import { getGalleryCard } from "./get-gallery-card";

const NOW = new Date("2026-10-04T03:00:00Z");

describe("getGalleryCard", () => {
  it("AC-GAL-001 offers Buat galeri on a booked project without a gallery", async () => {
    const card = await getGalleryCard(
      fixtureGalleries(),
      fakeCipher,
      WORKSPACE,
      BOOKED_PROJECT_ID,
      NOW,
    );
    expect(card).toMatchObject({ canCreate: true, gallery: null, project: { status: "BOOKED" } });
  });

  it("AC-GAL-003 offers nothing on a draft or cancelled project", async () => {
    const galleries = fixtureGalleries();
    for (const id of [DRAFT_PROJECT_ID, CANCELLED_PROJECT_ID]) {
      const card = await getGalleryCard(galleries, fakeCipher, WORKSPACE, id, NOW);
      expect(card.canCreate).toBe(false);
    }
  });

  it("AC-GAL-001 shows the new gallery in its derived state, and its decrypted password", async () => {
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
    const card = await getGalleryCard(galleries, fakeCipher, WORKSPACE, BOOKED_PROJECT_ID, NOW);
    expect(card.canCreate).toBe(false);
    expect(card.gallery).toMatchObject({ id: "g-1", state: "OPEN", password: "mawar-4821" });
  });

  it("AC-GAL-025 treats another workspace's project as not found", async () => {
    await expect(
      getGalleryCard(fixtureGalleries(), fakeCipher, OTHER_WORKSPACE, BOOKED_PROJECT_ID, NOW),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
