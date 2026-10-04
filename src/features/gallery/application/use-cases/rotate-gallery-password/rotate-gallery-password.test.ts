import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { rotateGalleryPassword } from "./rotate-gallery-password";

describe("rotateGalleryPassword", () => {
  it("AC-GAL-021 replaces the hash, bumps the version and records the actor", async () => {
    const { deps, sources } = await lifecycleSetup({ status: "PUBLISHED" });
    const result = await rotateGalleryPassword(
      { ...deps, cipher: fakeCipher, hasher: fakeHasher },
      WORKSPACE,
      OWNER_ID,
      GALLERY_ID,
      { password: "baru2026" },
    );
    expect(result).toEqual({ ok: true });
    expect(sources.galleries.get(GALLERY_ID)).toMatchObject({
      passwordVersion: 2,
      passwordHash: "hash(baru2026)",
      passwordChangedBy: OWNER_ID,
    });
  });

  it("AC-GAL-002 AC-GAL-022 refuses a short password or an archived gallery", async () => {
    const { deps } = await lifecycleSetup({ status: "ARCHIVED" });
    const rotateDeps = { ...deps, cipher: fakeCipher, hasher: fakeHasher };
    expect(
      await rotateGalleryPassword(rotateDeps, WORKSPACE, OWNER_ID, GALLERY_ID, {
        password: "abc12",
      }),
    ).toMatchObject({ fieldErrors: { password: "TOO_SHORT" } });
    expect(
      await rotateGalleryPassword(rotateDeps, WORKSPACE, OWNER_ID, GALLERY_ID, {
        password: "baru2026",
      }),
    ).toEqual({ ok: false, code: "INVALID_STATE" });
  });
});
