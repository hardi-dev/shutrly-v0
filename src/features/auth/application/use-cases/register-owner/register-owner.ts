import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { registerOwnerSchema } from "./register-owner.schema";
import type { RegisterOwnerResult } from "./register-owner.types";

/**
 * Register an Owner without revealing whether the email already exists (A-5). New,
 * existing-unverified and existing-verified emails make the same calls and get the same answer;
 * the identity adapter only creates or emails where the account's state allows it.
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns `{ ok, email }` (always the same), a validation failure, or `RATE_LIMITED`
 */
export async function registerOwner(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<RegisterOwnerResult> {
  const parsed = registerOwnerSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);
  const log = { operation: "register", requestId: deps.requestId } as const;

  if (!(await allowLimitedAction(deps.rateLimiter, "REGISTER", email, meta.ip))) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  const { name, password } = parsed.data;
  await deps.identity.createPasswordUser({ name, email, password });
  await deps.identity.sendVerificationLink(email);
  // ADR-011: the send happens after the response, so timing can't reveal the account state.
  deps.outbox.flushInBackground(deps.waitUntil);
  authLog({ ...log, outcome: "PENDING" });
  return { ok: true, email };
}
