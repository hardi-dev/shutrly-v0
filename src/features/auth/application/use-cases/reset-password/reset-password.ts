import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { resetPasswordSchema } from "./reset-password.schema";
import type { ResetPasswordResult } from "./reset-password.types";

/**
 * Set a new password from the latest, unused reset link (A-3). Every session is revoked, so the
 * owner signs in again on every device (A-4, AC-AUTH-017).
 * @param deps - the per-request auth ports
 * @param input - the untrusted token, password and confirmation
 * @returns ok, a validation failure, or `INVALID_LINK`
 */
export async function resetPassword(deps: AuthDeps, input: unknown): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { token, password } = parsed.data;
  const reset = token ? await deps.identity.resetPassword({ token, newPassword: password }) : false;
  const outcome = reset ? "RESET" : "INVALID_LINK";
  authLog({ operation: "reset-password", outcome, requestId: deps.requestId });
  return reset ? { ok: true } : failure("INVALID_LINK");
}
