/* eslint-disable @typescript-eslint/require-await -- the fakes mirror the asynchronous ports */

import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";

/** A reversible fake cipher that binds the ciphertext to its scope, like the AAD does. */
export const fakeCipher: GalleryPasswordCipherPort = {
  encrypt: async (password, scope) => ({
    ciphertext: `enc(${scope.workspaceId}:${scope.galleryId}:${password})`,
    iv: "iv",
    keyVersion: 1,
  }),
  decrypt: async (encrypted, scope) => {
    const prefix = `enc(${scope.workspaceId}:${scope.galleryId}:`;
    if (!encrypted.ciphertext.startsWith(prefix)) throw new Error("wrong scope");
    return encrypted.ciphertext.slice(prefix.length, -1);
  },
};

export const fakeHasher: PasswordHasherPort = {
  hash: async (password) => `hash(${password})`,
  verify: async (hash, password) => hash === `hash(${password})`,
};

/** A deterministic integer source cycling through the given values. */
export function fixedRandom(...values: number[]) {
  let index = 0;
  return (maxExclusive: number) => {
    const value = values[index % values.length] % maxExclusive;
    index += 1;
    return value;
  };
}
/* eslint-enable @typescript-eslint/require-await -- end of the fake */
