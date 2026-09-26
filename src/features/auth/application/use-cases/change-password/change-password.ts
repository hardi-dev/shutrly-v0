import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { requireOwner } from "../../policy/owner-access/owner-access";
import { changePasswordSchema } from "./change-password.schema";
import type { ChangePasswordResult } from "./change-password.types";

/**
 * Change the password with the current one; other sessions are revoked and this one stays
 * (A-4, AC-AUTH-019). It checks the owner itself (C-004).
 * @param deps - the per-request auth ports
 * @param input - the untrusted current, new and confirmation passwords
 * @param headers - the request headers carrying the session cookie
 * @returns the refreshed session cookies, a validation failure or `WRONG_CURRENT_PASSWORD`
 */
export async function changePassword(
  deps: AuthDeps,
  input: unknown,
  headers: Headers,
): Promise<ChangePasswordResult> {
  const owner = await requireOwner(deps, headers);
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { currentPassword, newPassword } = parsed.data;
  const changed = await deps.identity.changePassword({ currentPassword, newPassword }, headers);
  const outcome = changed.ok ? "CHANGED" : "WRONG_CURRENT";
  authLog({ operation: "change-password", outcome, requestId: deps.requestId, userId: owner.id });
  if (!changed.ok) {
    return failure("WRONG_CURRENT_PASSWORD", { currentPassword: "password.wrongCurrent" });
  }
  return { ok: true, setCookies: changed.setCookies };
}
