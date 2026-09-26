import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { continueAfterSignIn } from "../continue-after-sign-in/continue-after-sign-in";
import type { VerifyEmailResult } from "./verify-email.types";

/**
 * Consume a verification link: only the latest, unused, unexpired one works (A-3). A valid link
 * verifies the email and signs the owner in (A-7), then the access gate decides where they go.
 * @param deps - the per-request auth ports
 * @param token - the `token` from the emailed link
 * @returns the outcome and session cookies, or `INVALID_LINK`
 */
export async function verifyEmail(deps: AuthDeps, token: string): Promise<VerifyEmailResult> {
  const log = { operation: "verify-email", requestId: deps.requestId } as const;
  const verified = token ? await deps.identity.verifyEmail(token) : { ok: false as const };
  if (!verified.ok) {
    authLog({ ...log, outcome: "INVALID_LINK" });
    return failure("INVALID_LINK");
  }
  const outcome = await continueAfterSignIn(deps, verified.userId);
  authLog({ ...log, outcome: outcome.kind, userId: verified.userId });
  const setCookies = outcome.kind === "UNAVAILABLE" ? [] : verified.setCookies;
  return { ok: true, outcome, setCookies };
}
