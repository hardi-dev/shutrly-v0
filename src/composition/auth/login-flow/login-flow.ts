import "server-only";

import { loginOwner } from "@/features/auth/application/use-cases/login-owner/login-owner";
import type { LoginOwnerResult } from "@/features/auth/application/use-cases/login-owner/login-owner.types";
import { logoutOwner } from "@/features/auth/application/use-cases/logout-owner/logout-owner";

import { withAuthScope } from "../auth-scope/auth-scope";
import { clearPendingEmail } from "../pending-email-cookie/pending-email-cookie";
import { applySetCookies } from "../session-cookies/session-cookies";

/**
 * Password sign-in; on success the session cookies are set on the response.
 * @param values - the untrusted Login form values
 * @returns the use-case result (the caller redirects to `outcome.path`)
 */
export async function login(values: unknown): Promise<LoginOwnerResult> {
  const result = await withAuthScope((scope) => loginOwner(scope, values, scope.meta));
  if (result.ok) await applySetCookies(result.setCookies);
  return result;
}

/**
 * Sign out of this session only (AC-AUTH-012) and forget any pending email.
 * @returns nothing
 */
export async function logout(): Promise<void> {
  const cleared = await withAuthScope((scope) => logoutOwner(scope, scope.meta.headers));
  await applySetCookies(cleared.setCookies);
  await clearPendingEmail();
}
