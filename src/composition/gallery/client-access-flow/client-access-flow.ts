import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createWebCryptoClientSessionSigner } from "@/adapters/crypto/client-session-signer/web-crypto-client-session-signer";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { signInGallery } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery";
import type {
  ClientSignInActionResult,
  SignInGalleryDeps,
} from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery.types";

import type { RequestContext } from "../../request-context/request-context.types";
import { withRequestDb } from "../../request-db/request-db";

// ADR-021: one signed cookie per project link, scoped to its path.
export const CLIENT_SESSION_COOKIE = "shutrly_gallery";

/** Runs client work with the gate's request-scoped dependencies (ADR-021). @param work - the client work @returns whatever `work` resolves to */
export function withClientScope<T>(
  work: (deps: SignInGalleryDeps, rc: RequestContext) => Promise<T>,
): Promise<T> {
  return withRequestDb((db, rc) =>
    work(
      {
        repository: createDrizzleClientAccessRepository(db),
        rateLimiter: createNeonRateLimiter(db),
        signer: createWebCryptoClientSessionSigner(rc.env.CLIENT_SESSION_KEY),
        hasher: createBetterAuthPasswordHasher(),
        newSessionId: () => crypto.randomUUID().replaceAll("-", ""),
        now: new Date(),
      },
      rc,
    ),
  );
}

/** Checks the gallery password; on success sets the path-scoped cookie and opens the gallery (D-3, D-5). @param rawToken - the untrusted route token @param values - the untrusted form values @returns the refusal to show; redirects on success */
export async function signInGalleryEntry(
  rawToken: string,
  values: unknown,
): Promise<ClientSignInActionResult> {
  const result = await withClientScope((deps, rc) =>
    signInGallery(deps, { token: rawToken, ip: rc.ip, values }),
  );
  if (result.kind !== "SIGNED_IN") return result;
  (await cookies()).set(CLIENT_SESSION_COOKIE, result.cookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: `/g/${rawToken}`,
    maxAge: result.maxAgeSeconds,
  });
  redirect(`/g/${rawToken}`);
}
