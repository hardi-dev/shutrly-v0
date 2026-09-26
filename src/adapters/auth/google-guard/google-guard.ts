import "server-only";

import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import { googleLinkDecision } from "@/features/auth/domain/account/account";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { GoogleClaims } from "../create-auth/create-auth.types";

/**
 * The BR-AUTH-007 takeover guard. Better Auth 1.7.6 calls Google `mapProfileToUser` with the
 * ID-token claims before it looks up the local user, so an unverified local account that is
 * about to be linked is verified, loses its password and loses every session first.
 * @param accounts - the account directory port
 * @returns the callback for `CreateAuthDeps.onGoogleClaims`
 */
export function createGoogleClaimsGuard(
  accounts: Pick<AccountDirectoryPort, "findByEmail" | "applyGoogleTakeoverGuard">,
): (claims: GoogleClaims) => Promise<void> {
  return async (claims) => {
    const existing = await accounts.findByEmail(normaliseEmail(claims.email));
    const decision = googleLinkDecision({ googleEmailVerified: claims.email_verified, existing });
    if (decision === "LINK_WITH_TAKEOVER_GUARD" && existing) {
      await accounts.applyGoogleTakeoverGuard(existing.id);
    }
  };
}
