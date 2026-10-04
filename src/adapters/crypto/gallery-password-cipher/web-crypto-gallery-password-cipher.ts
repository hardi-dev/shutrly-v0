import "server-only";

import type {
  EncryptedPassword,
  GalleryCipherScope,
  GalleryPasswordCipherPort,
} from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";

// ADR-017, D-3: AES-256-GCM with a 96-bit random IV per encryption and the row as AAD.
export const GALLERY_PASSWORD_KEY_VERSION = 1;
const IV_BYTES = 12;
const ALGORITHM = "AES-GCM";

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function aadOf(scope: GalleryCipherScope): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(`gallery:${scope.workspaceId}:${scope.galleryId}`);
}

/** Creates the gallery password cipher from the base64url `GALLERY_PASSWORD_KEY` (32 bytes, ADR-017). @param rawKey - the Worker secret @returns the cipher port */
export function createWebCryptoGalleryPasswordCipher(rawKey: string): GalleryPasswordCipherPort {
  const key = crypto.subtle.importKey("raw", fromBase64Url(rawKey), ALGORITHM, false, [
    "encrypt",
    "decrypt",
  ]);
  return {
    async encrypt(password, scope): Promise<EncryptedPassword> {
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const params = { name: ALGORITHM, iv, additionalData: aadOf(scope) };
      const plain = new TextEncoder().encode(password);
      const sealed = await crypto.subtle.encrypt(params, await key, plain);
      return {
        ciphertext: toBase64Url(new Uint8Array(sealed)),
        iv: toBase64Url(iv),
        keyVersion: GALLERY_PASSWORD_KEY_VERSION,
      };
    },
    async decrypt(encrypted, scope): Promise<string> {
      if (encrypted.keyVersion !== GALLERY_PASSWORD_KEY_VERSION) {
        throw new Error("Unknown gallery password key version");
      }
      const params = {
        name: ALGORITHM,
        iv: fromBase64Url(encrypted.iv),
        additionalData: aadOf(scope),
      };
      const opened = await crypto.subtle.decrypt(
        params,
        await key,
        fromBase64Url(encrypted.ciphertext),
      );
      return new TextDecoder().decode(opened);
    },
  };
}
