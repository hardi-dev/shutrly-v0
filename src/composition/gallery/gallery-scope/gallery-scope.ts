import "server-only";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import { createFixtureDriveProvider } from "@/adapters/source/fixture-drive-provider/fixture-drive-provider";
import { createGoogleDriveProvider } from "@/adapters/source/google-drive-provider/google-drive-provider";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import type { AppEnv } from "@/shared/env/app-env.types";

import { withRequestDb } from "../../request-db/request-db";
import type { GalleryScope } from "./gallery-scope.types";

/** The Drive provider, or the fixture under E2E_FAKE_DRIVE, which appEnvSchema refuses on production (TD › Testing Strategy). @param env - the Worker env @returns the provider */
export function providerFor(env: AppEnv): GallerySourceProviderPort {
  return env.E2E_FAKE_DRIVE === "1"
    ? createFixtureDriveProvider()
    : createGoogleDriveProvider(env.GOOGLE_DRIVE_API_KEY);
}

/** Runs gallery work with request-scoped repositories and the gallery secrets from the Worker env (ADR-017, C-103). @param work - the gallery work @returns whatever `work` resolves to */
export function withGalleryScope<T>(work: (scope: GalleryScope) => Promise<T>): Promise<T> {
  return withRequestDb((db, rc) =>
    work({
      galleries: createDrizzleGalleryRepository(db),
      browse: createDrizzleGalleryBrowseReader(db),
      sources: createDrizzleGallerySourceRepository(db),
      workspaceSources: createDrizzleWorkspaceSourceRepository(db),
      provider: providerFor(rc.env),
      directImages: rc.env.E2E_FAKE_DRIVE !== "1",
      rateLimiter: createNeonRateLimiter(db),
      cipher: createWebCryptoGalleryPasswordCipher(rc.env.GALLERY_PASSWORD_KEY),
      hasher: createBetterAuthPasswordHasher(),
      randomInt: createWebCryptoRandomInt(),
      newId: () => crypto.randomUUID(),
      now: new Date(),
    }),
  );
}
