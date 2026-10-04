import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "./web-crypto-gallery-password-cipher";

const SCOPE = { workspaceId: "ws-a", galleryId: "gallery-1" };

describe("web crypto gallery password cipher (ADR-017, D-3)", () => {
  it("AC-GAL-027 round-trips a password without storing it in plain text", async () => {
    const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
    const sealed = await cipher.encrypt("mawar-4821", SCOPE);
    expect(sealed.ciphertext).not.toContain("mawar");
    expect(sealed.keyVersion).toBe(1);
    expect(await cipher.decrypt(sealed, SCOPE)).toBe("mawar-4821");
  });

  it("D-3 refuses a ciphertext moved to another gallery (wrong AAD)", async () => {
    const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
    const sealed = await cipher.encrypt("mawar-4821", SCOPE);
    await expect(cipher.decrypt(sealed, { ...SCOPE, galleryId: "gallery-2" })).rejects.toThrow();
    await expect(cipher.decrypt(sealed, { ...SCOPE, workspaceId: "ws-b" })).rejects.toThrow();
  });

  it("D-3 uses a fresh IV every time", async () => {
    const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
    const first = await cipher.encrypt("mawar-4821", SCOPE);
    const second = await cipher.encrypt("mawar-4821", SCOPE);
    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  it("D-3 refuses an unknown key version", async () => {
    const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
    const sealed = await cipher.encrypt("mawar-4821", SCOPE);
    await expect(cipher.decrypt({ ...sealed, keyVersion: 2 }, SCOPE)).rejects.toThrow();
  });
});
