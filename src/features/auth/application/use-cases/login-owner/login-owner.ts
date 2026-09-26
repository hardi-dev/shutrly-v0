import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import {
  isLoginBlocked,
  recordLoginFailure,
} from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { continueAfterSignIn } from "../continue-after-sign-in/continue-after-sign-in";
import { loginOwnerSchema } from "./login-owner.schema";
import type { LoginOwnerResult } from "./login-owner.types";

/**
 * Password sign-in, in the order of diagrams/sequence/login-email-password.md: rate limit →
 * credentials → status → verification. Unknown email and wrong password look the same (A-5).
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns the outcome and session cookies, or a failure code
 */
export async function loginOwner(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<LoginOwnerResult> {
  const parsed = loginOwnerSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);
  const log = { operation: "login", requestId: deps.requestId } as const;

  if (await isLoginBlocked(deps.rateLimiter, email, meta.ip)) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  const credentials = { email, password: parsed.data.password };
  const signedIn = await deps.identity.signInWithPassword(credentials, meta.headers);
  if (!signedIn.ok) {
    await recordLoginFailure(deps.rateLimiter, email, meta.ip);
    authLog({ ...log, outcome: "INVALID_CREDENTIALS" });
    return failure("INVALID_CREDENTIALS");
  }
  const outcome = await continueAfterSignIn(deps, signedIn.userId);
  authLog({ ...log, outcome: outcome.kind, userId: signedIn.userId });
  if (outcome.kind === "UNAVAILABLE") return failure("ACCOUNT_UNAVAILABLE");
  return { ok: true, outcome, setCookies: signedIn.setCookies };
}
