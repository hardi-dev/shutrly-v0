import "server-only";

import { createWebCryptoAccessTokenGenerator } from "@/adapters/crypto/access-token-generator/web-crypto-access-token-generator";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { ProjectScope } from "./project-scope.types";

export function withProjectScope<T>(work: (scope: ProjectScope) => Promise<T>): Promise<T> {
  return withRequestDb((db) =>
    work({
      projects: createDrizzleProjectRepository(db),
      accessTokens: createWebCryptoAccessTokenGenerator(),
      now: () => new Date(),
    }),
  );
}
