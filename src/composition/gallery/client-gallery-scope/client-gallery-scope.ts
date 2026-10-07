import "server-only";

import { cookies } from "next/headers";

import { createWorkersClientListCache } from "@/adapters/cache/workers-client-list-cache/workers-client-list-cache";
import { createWebCryptoClientSessionSigner } from "@/adapters/crypto/client-session-signer/web-crypto-client-session-signer";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { createDrizzleClientGalleryReader } from "@/adapters/db/gallery-repository/drizzle-client-gallery-reader";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import { resolveClientAccess } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access";
import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type { RequestContext } from "../../request-context/request-context.types";
import { withRequestDb } from "../../request-db/request-db";
import { CLIENT_SESSION_COOKIE } from "../client-access-flow/client-access-flow";
import { providerFor } from "../gallery-scope/gallery-scope";
import type { ClientGalleryScope, ClientScopeResult } from "./client-gallery-scope.types";

function scopeFor(db: Db, rc: RequestContext, now: Date): ClientGalleryScope {
  return {
    selections: createDrizzleSelectionRepository(db),
    rateLimiter: createNeonRateLimiter(db),
    browse: createDrizzleGalleryBrowseReader(db, { client: true }),
    reader: createDrizzleClientGalleryReader(db),
    provider: providerFor(rc.env),
    directImages: rc.env.E2E_FAKE_DRIVE !== "1",
    cache: createWorkersClientListCache(),
    now,
  };
}

/**
 * Runs the client gate, then the work for a signed-in client on the same request database
 * (D-4 on every page, action and route; ADR-021). Nothing runs for a signed-out client.
 * @param rawToken - the untrusted route token
 * @param work - the signed-in work
 * @returns the neutral or password outcome, or the work's value with the client context
 */
export async function withSignedInClient<T>(
  rawToken: string,
  work: (client: ClientContext, scope: ClientGalleryScope) => Promise<T>,
): Promise<ClientScopeResult<T>> {
  const cookie = (await cookies()).get(CLIENT_SESSION_COOKIE)?.value ?? null;
  return withRequestDb(async (db, rc) => {
    const now = new Date();
    const gate = await resolveClientAccess(
      {
        repository: createDrizzleClientAccessRepository(db),
        rateLimiter: createNeonRateLimiter(db),
        signer: createWebCryptoClientSessionSigner(rc.env.CLIENT_SESSION_KEY),
        now,
      },
      { token: rawToken, ip: rc.ip, cookie },
    );
    if (gate.kind !== "SIGNED_IN") return gate;
    const value = await work(gate.context, scopeFor(db, rc, now));
    return { kind: "SIGNED_IN", gate: gate.gate, client: gate.context, value };
  });
}
