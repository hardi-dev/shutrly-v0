import "server-only";

import { requestPasswordReset } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset";
import type { RequestPasswordResetResult } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";
import { resetPassword } from "@/features/auth/application/use-cases/reset-password/reset-password";
import type { ResetPasswordResult } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * Forgot password (AC-AUTH-016): always the same answer.
 * @param values - the untrusted Forgot password form values
 * @returns the use-case result
 */
export function requestReset(values: unknown): Promise<RequestPasswordResetResult> {
  return withAuthScope((scope) => requestPasswordReset(scope, values, scope.meta));
}

/**
 * Set a new password from a reset link (AC-AUTH-017).
 * @param values - the untrusted token, password and confirmation
 * @returns the use-case result
 */
export function resetWithLink(values: unknown): Promise<ResetPasswordResult> {
  return withAuthScope((scope) => resetPassword(scope, values));
}

/**
 * Check a reset link when its page opens, so a used or superseded link shows the invalid
 * screen at once (AC-AUTH-018).
 * @param token - the link token; empty means no link
 * @returns whether the link can still be used
 */
export function isResetLinkUsable(token: string): Promise<boolean> {
  if (!token) return Promise.resolve(false);
  return withAuthScope((scope) => scope.identity.isResetLinkUsable(token));
}
