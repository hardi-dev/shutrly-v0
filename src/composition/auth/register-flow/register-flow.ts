import "server-only";

import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import type { RegisterOwnerResult } from "@/features/auth/application/use-cases/register-owner/register-owner.types";
import { resendVerification } from "@/features/auth/application/use-cases/resend-verification/resend-verification";
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { withAuthScope } from "../auth-scope/auth-scope";
import { readPendingEmail, writePendingEmail } from "../pending-email-cookie/pending-email-cookie";

/**
 * Register, then remember the email in the pending-email cookie (SPEC GAP-3).
 * @param values - the untrusted Register form values
 * @returns the use-case result
 */
export function register(values: unknown): Promise<RegisterOwnerResult> {
  return withAuthScope(async (scope) => {
    const result = await registerOwner(scope, values, scope.meta);
    if (result.ok) await writePendingEmail(result.email, scope.secret);
    return result;
  });
}

/**
 * Resend verification to the restricted session's email, else the pending-email cookie's.
 * @returns the use-case result, or null when the request identifies no email
 */
export function resendVerificationEmail(): Promise<ResendVerificationResult | null> {
  return withAuthScope(async (scope) => {
    const userId = await scope.identity.getSessionUserId(scope.meta.headers);
    const account = userId ? await scope.accounts.getById(userId) : null;
    const email = account?.email ?? (await readPendingEmail(scope.secret));
    if (!email) return null;
    return resendVerification(scope, { email: normaliseEmail(email) }, scope.meta);
  });
}
