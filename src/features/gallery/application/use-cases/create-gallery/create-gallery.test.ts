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

import { createGallery } from "./create-gallery";

const NOW = new Date("2026-10-04T03:00:00Z");
const NONE = { type: "NONE" };

function setup() {
  const galleries = fixtureGalleries();
  let next = 0;
  const deps = {
    galleries,
    cipher: fakeCipher,
    hasher: fakeHasher,
    newId: () => {
      next += 1;
      return `gallery-${String(next)}`;
    },
    now: NOW,
  };
  return { galleries, deps };
}

describe("createGallery", () => {
  it("AC-GAL-001 creates one DRAFT gallery storing the password encrypted and hashed", async () => {
    const { galleries, deps } = setup();
    const result = await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, {
      password: "  mawar-4821 ",
      expiry: NONE,
    });
    expect(result).toEqual({ ok: true, galleryId: "gallery-1" });
    const stored = galleries.galleries[0];
    expect(stored.status).toBe("DRAFT");
    expect(stored.passwordVersion).toBe(1);
    expect(stored.passwordHash).toBe("hash(mawar-4821)");
    expect(stored.password.ciphertext).toContain(`${WORKSPACE.workspaceId}:gallery-1`);
    expect(stored.password.ciphertext).not.toBe("mawar-4821");
  });

  it("AC-GAL-002 refuses 5 and 65 characters and accepts 6 and 64", async () => {
    const { galleries, deps } = setup();
    const short = await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, {
      password: "abc12",
      expiry: NONE,
    });
    expect(short).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { password: "TOO_SHORT" },
    });
    const long = await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, {
      password: "a".repeat(65),
      expiry: NONE,
    });
    expect(long).toMatchObject({ fieldErrors: { password: "TOO_LONG" } });
    expect(galleries.galleries).toHaveLength(0);
    const six = { password: "abc123", expiry: NONE };
    expect(await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, six)).toMatchObject({
      ok: true,
    });
    const other = fixtureGalleries();
    const sixtyFour = { password: "a".repeat(64), expiry: NONE };
    const result = await createGallery(
      { ...deps, galleries: other },
      WORKSPACE,
      OWNER_ID,
      BOOKED_PROJECT_ID,
      sixtyFour,
    );
    expect(result).toMatchObject({ ok: true });
  });

  it("AC-GAL-003 refuses a DRAFT or CANCELLED project with a domain error", async () => {
    const { galleries, deps } = setup();
    const values = { password: "mawar-4821", expiry: NONE };
    for (const projectId of [DRAFT_PROJECT_ID, CANCELLED_PROJECT_ID]) {
      expect(await createGallery(deps, WORKSPACE, OWNER_ID, projectId, values)).toEqual({
        ok: false,
        code: "NOT_ALLOWED_FOR_PROJECT",
      });
    }
    expect(galleries.galleries).toHaveLength(0);
  });

  it("AC-GAL-004 refuses a second gallery for the project", async () => {
    const { galleries, deps } = setup();
    const values = { password: "mawar-4821", expiry: NONE };
    await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, values);
    expect(await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, values)).toEqual({
      ok: false,
      code: "ALREADY_EXISTS",
    });
    expect(galleries.galleries).toHaveLength(1);
  });

  it("AC-GAL-018 keeps a duration on the draft and AC-GAL-019 refuses a past date", async () => {
    const { galleries, deps } = setup();
    const days = { password: "mawar-4821", expiry: { type: "DAYS", days: 30 } };
    await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, days);
    expect(galleries.galleries[0]).toMatchObject({ expiryDays: 30, expiresAt: null });
    const past = { password: "mawar-4821", expiry: { type: "DATE", date: "2026-10-03" } };
    expect(await createGallery(deps, WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, past)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "expiry.date": "PAST_DATE" },
    });
  });

  it("AC-GAL-025 treats another workspace's project as not found", async () => {
    const { deps } = setup();
    await expect(
      createGallery(deps, OTHER_WORKSPACE, OWNER_ID, BOOKED_PROJECT_ID, {
        password: "mawar-4821",
        expiry: NONE,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
