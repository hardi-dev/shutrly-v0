import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { AUTH_PATH } from "../../policy/destination-path/destination-path";
import type { GoogleStart } from "../../ports/identity/identity.port";

/**
 * Start Google sign-in with identity scopes only (ADR-012). Better Auth returns to
 * `/auth/continue` on success and to `/login?error=…` on failure or cancel.
 * @param deps - the identity port
 * @returns the Google authorization URL and the OAuth state cookies
 */
export function startGoogleSignIn(deps: Pick<AuthDeps, "identity">): Promise<GoogleStart> {
  return deps.identity.googleSignInUrl({
    callbackURL: AUTH_PATH.googleContinue,
    errorCallbackURL: AUTH_PATH.login,
  });
}
