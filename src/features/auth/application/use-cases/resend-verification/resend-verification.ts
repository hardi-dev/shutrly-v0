import "server-only";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import type { ResendSubject, ResendVerificationResult } from "./resend-verification.types";

/**
 * Send a fresh verification link that supersedes the older ones (AC-AUTH-006). Delivery is
 * awaited here, so a provider failure can be shown and retried (SPEC GAP-4, AC-AUTH-022).
 * @param deps - the per-request auth ports
 * @param subject - the email from the restricted session or the pending-email cookie
 * @param meta - the client IP and headers
 * @returns ok, `RATE_LIMITED` or `EMAIL_DELIVERY_FAILED`
 */
export async function resendVerification(
  deps: AuthDeps,
  subject: ResendSubject,
  meta: RequestMeta,
): Promise<ResendVerificationResult> {
  const log = { operation: "resend-verification", requestId: deps.requestId } as const;
  if (
    !(await allowLimitedAction(deps.rateLimiter, "RESEND_VERIFICATION", subject.email, meta.ip))
  ) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  await deps.identity.sendVerificationLink(subject.email);
  // A verified account gets no link, and the same answer (A-5).
  if (deps.outbox.pendingCount === 0) return { ok: true };
  const delivery = await deps.outbox.flush();
  authLog({ ...log, outcome: delivery });
  return delivery === "SENT" ? { ok: true } : failure("EMAIL_DELIVERY_FAILED");
}
