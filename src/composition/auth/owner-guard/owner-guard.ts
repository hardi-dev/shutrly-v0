import "server-only";

import { redirect } from "next/navigation";

import { AuthError } from "@/features/auth/application/errors/auth-errors/auth-errors";
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import {
  AUTH_PATH,
  DESTINATION_PATH,
} from "@/features/auth/application/policy/destination-path/destination-path";
import {
  requireOwner,
  resolveOwnerAccess,
} from "@/features/auth/application/policy/owner-access/owner-access";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * The screen for each refusal of the owner gate.
 * @param code - the refusal code from `requireOwner`
 * @returns `/verify`, `/account-unavailable` or `/login`
 */
export function ownerRedirectFor(code: AuthErrorCode): string {
  if (code === "EMAIL_UNVERIFIED") return AUTH_PATH.verify;
  if (code === "ACCOUNT_UNAVAILABLE") return AUTH_PATH.unavailable;
  return AUTH_PATH.login;
}

/**
 * Run owner work and turn a gate refusal into a redirect (C-004): pages and server actions.
 * @param work - work that calls `requireOwner` (directly or through a use case)
 * @returns the work's result; redirects on `AuthError`
 */
export async function redirectOnRefusal<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AuthError) redirect(ownerRedirectFor(error.code));
    throw error;
  }
}

/**
 * The first call in every owner page (C-004): an active, verified owner or a redirect.
 * @returns the owner's account
 */
export function requireOwnerOrRedirect(): Promise<AccountRecord> {
  return redirectOnRefusal(() => withAuthScope((scope) => requireOwner(scope, scope.meta.headers)));
}

/**
 * AC-AUTH-011: auth pages send a signed-in owner on to their destination, and a restricted
 * session to Verification pending.
 * @returns nothing; redirects when there is a usable session
 */
export async function redirectIfSignedIn(): Promise<void> {
  const target = await withAuthScope(async (scope) => {
    const { decision, account } = await resolveOwnerAccess(scope, scope.meta.headers);
    if (decision === "OWNER" && account) {
      return DESTINATION_PATH[await scope.destination.resolve(account.id)];
    }
    return decision === "RESTRICTED" ? AUTH_PATH.verify : null;
  });
  if (target) redirect(target);
}
