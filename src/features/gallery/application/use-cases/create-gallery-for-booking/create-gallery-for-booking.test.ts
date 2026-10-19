import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import {
  BOOKED_PROJECT_ID,
  CANCELLED_PROJECT_ID,
  DRAFT_PROJECT_ID,
  fixtureGalleries,
  OTHER_WORKSPACE,
  WORKSPACE,
} from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it } from "vitest";

import { createGalleryForBooking, prepareGalleryPassword } from "./create-gallery-for-booking";

const OWNER = "owner-1";

function setup() {
  const galleries = fixtureGalleries();
  let next = 0;
  const deps = {
    cipher: fakeCipher,
    hasher: fakeHasher,
    passwords: { propose: () => "mawar-4821" },
    newId: () => {
      next += 1;
      return `gallery-${String(next)}`;
    },
  };
  return { galleries, deps };
}

describe("prepareGalleryPassword", () => {
  it("AC-GFL-001 prepares an id, an encrypted password and its hash before any transaction", async () => {
    const { deps } = setup();
    const prepared = await prepareGalleryPassword(deps, WORKSPACE);
    expect(prepared.galleryId).toBe("gallery-1");
    expect(prepared.passwordHash).toBe("hash(mawar-4821)");
    expect(prepared.password.ciphertext).toBe(`enc(${WORKSPACE.workspaceId}:gallery-1:mawar-4821)`);
  });
});

describe("createGalleryForBooking", () => {
  it("AC-GFL-001 creates one gallery with no expiry, no sources and one OPEN selection group", async () => {
    const { galleries, deps } = setup();
    const prepared = await prepareGalleryPassword(deps, WORKSPACE);
    const result = await createGalleryForBooking(
      { galleries },
      WORKSPACE,
      OWNER,
      BOOKED_PROJECT_ID,
      prepared,
    );
    expect(result).toEqual({ ok: true, created: true });
    expect(galleries.galleries).toHaveLength(1);
    expect(galleries.galleries[0]).toMatchObject({
      id: "gallery-1",
      projectId: BOOKED_PROJECT_ID,
      expiresAt: null,
      passwordHash: "hash(mawar-4821)",
      passwordVersion: 1,
    });
    expect(galleries.linkedFolders).toHaveLength(0);
    expect(galleries.selectionGroups).toEqual(["gallery-1"]);
  });

  it("AC-GFL-001 keeps the stored password encrypted with the gallery id as scope", async () => {
    const { galleries, deps } = setup();
    const prepared = await prepareGalleryPassword(deps, WORKSPACE);
    await createGalleryForBooking({ galleries }, WORKSPACE, OWNER, BOOKED_PROJECT_ID, prepared);
    expect(galleries.galleries[0].password.ciphertext).not.toBe("mawar-4821");
    expect(galleries.galleries[0].password.ciphertext).toContain(":gallery-1:");
  });

  it("AC-GFL-004 is a no-op success when the project already has a gallery", async () => {
    const { galleries, deps } = setup();
    const first = await prepareGalleryPassword(deps, WORKSPACE);
    await createGalleryForBooking({ galleries }, WORKSPACE, OWNER, BOOKED_PROJECT_ID, first);
    const second = await prepareGalleryPassword(deps, WORKSPACE);
    const result = await createGalleryForBooking(
      { galleries },
      WORKSPACE,
      OWNER,
      BOOKED_PROJECT_ID,
      second,
    );
    expect(result).toEqual({ ok: true, created: false });
    expect(galleries.galleries).toHaveLength(1);
    expect(galleries.selectionGroups).toEqual(["gallery-1"]);
  });

  it("AC-GFL-003 refuses a DRAFT or CANCELLED project and creates nothing", async () => {
    const { galleries, deps } = setup();
    const prepared = await prepareGalleryPassword(deps, WORKSPACE);
    for (const projectId of [DRAFT_PROJECT_ID, CANCELLED_PROJECT_ID]) {
      expect(
        await createGalleryForBooking({ galleries }, WORKSPACE, OWNER, projectId, prepared),
      ).toEqual({ ok: false, code: "NOT_ALLOWED_FOR_PROJECT" });
    }
    expect(galleries.galleries).toHaveLength(0);
    expect(galleries.selectionGroups).toHaveLength(0);
  });

  it("AC-GFL-025 treats another workspace's project as not found", async () => {
    const { galleries, deps } = setup();
    const prepared = await prepareGalleryPassword(deps, OTHER_WORKSPACE);
    await expect(
      createGalleryForBooking({ galleries }, OTHER_WORKSPACE, OWNER, BOOKED_PROJECT_ID, prepared),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
