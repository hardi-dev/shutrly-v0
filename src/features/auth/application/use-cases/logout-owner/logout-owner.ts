import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { authLog } from "../../logging/auth-log/auth-log";
import type { SessionCookies } from "../../ports/identity/identity.port";

/**
 * End the current session only; other devices stay signed in (AC-AUTH-012).
 * @param deps - the per-request auth ports
 * @param headers - the request headers carrying the session cookie
 * @returns the cookies that clear the session
 */
export async function logoutOwner(deps: AuthDeps, headers: Headers): Promise<SessionCookies> {
  const cleared = await deps.identity.signOut(headers);
  authLog({ operation: "logout", outcome: "SIGNED_OUT", requestId: deps.requestId });
  return cleared;
}
