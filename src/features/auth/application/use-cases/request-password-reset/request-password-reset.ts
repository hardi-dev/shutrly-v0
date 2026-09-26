import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { requestPasswordResetSchema } from "./request-password-reset.schema";
import type { RequestPasswordResetResult } from "./request-password-reset.types";

/**
 * Forgot password: the same answer for every email (A-5). Mail goes out only for a
 * password-backed account (BR-AUTH-008) within the A-6 limits, after the response (ADR-011).
 * Over the limit it is silently not sent (AC-AUTH-016).
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns ok, or a validation failure
 */
export async function requestPasswordReset(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<RequestPasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);

  if (await allowLimitedAction(deps.rateLimiter, "FORGOT_PASSWORD", email, meta.ip)) {
    const account = await deps.accounts.findByEmail(email);
    if (account?.hasPassword) await deps.identity.sendResetLink(email);
    deps.outbox.flushInBackground(deps.waitUntil);
  }
  authLog({ operation: "forgot-password", outcome: "CONFIRMED", requestId: deps.requestId });
  return { ok: true };
}
