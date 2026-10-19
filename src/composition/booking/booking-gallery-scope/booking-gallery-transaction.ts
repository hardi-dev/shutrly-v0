import "server-only";

import { createWebCryptoAccessTokenGenerator } from "@/adapters/crypto/access-token-generator/web-crypto-access-token-generator";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";

import type { BookingGalleryScope } from "./booking-gallery-scope.types";

// Scope-free: takes its own `db`, so the seed script can book projects with galleries (D-14). The
// request-bound wrappers live in booking-gallery-scope.ts.

/** Runs one booking work over project and gallery repositories bound to ONE transaction (ADR-016, AC-GFL-003, C-005). @param db - the database @param work - the booking work @returns whatever `work` resolves to */
export function runBookingGalleryTransaction<T>(
  db: Db,
  work: (scope: BookingGalleryScope) => Promise<T>,
): Promise<T> {
  return db.transaction((tx) =>
    work({
      projects: createDrizzleProjectRepository(tx),
      accessTokens: createWebCryptoAccessTokenGenerator(),
      galleries: createDrizzleGalleryRepository(tx),
    }),
  );
}
