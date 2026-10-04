import "server-only";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { GalleryScope } from "./gallery-scope.types";

/** Runs gallery work with request-scoped repositories and the gallery secrets from the Worker env (ADR-017, C-103). @param work - the gallery work @returns whatever `work` resolves to */
export function withGalleryScope<T>(work: (scope: GalleryScope) => Promise<T>): Promise<T> {
  return withRequestDb((db, rc) =>
    work({
      galleries: createDrizzleGalleryRepository(db),
      cipher: createWebCryptoGalleryPasswordCipher(rc.env.GALLERY_PASSWORD_KEY),
      hasher: createBetterAuthPasswordHasher(),
      randomInt: createWebCryptoRandomInt(),
      newId: () => crypto.randomUUID(),
      now: new Date(),
    }),
  );
}
