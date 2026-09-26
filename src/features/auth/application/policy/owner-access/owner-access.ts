import "server-only";

import { accessDecision } from "@/features/auth/domain/account/account";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";

import { AuthError } from "../../errors/auth-errors/auth-errors";
import type { OwnerAccess, OwnerAccessDeps } from "./owner-access.types";

/**
 * Read the session and its account from the database on every call. The cookie cache is off,
 * so a status change blocks even sessions that were never revoked (AC-AUTH-014).
 * @param deps - the identity and account ports
 * @param headers - the request headers carrying the session cookie
 * @returns the access decision and the account, if any
 */
export async function resolveOwnerAccess(
  deps: OwnerAccessDeps,
  headers: Headers,
): Promise<OwnerAccess> {
  const userId = await deps.identity.getSessionUserId(headers);
  const account = userId ? await deps.accounts.getById(userId) : null;
  return { decision: accessDecision(account), account };
}

/**
 * The gate for every owner page, action and route (C-004): an active, verified session.
 * @param deps - the identity and account ports
 * @param headers - the request headers carrying the session cookie
 * @returns the owner's account; throws `AuthError` `AUTH_REQUIRED`, `EMAIL_UNVERIFIED` or
 *   `ACCOUNT_UNAVAILABLE` otherwise
 */
export async function requireOwner(
  deps: OwnerAccessDeps,
  headers: Headers,
): Promise<AccountRecord> {
  const { decision, account } = await resolveOwnerAccess(deps, headers);
  if (decision === "OWNER" && account) return account;
  if (decision === "RESTRICTED") throw new AuthError("EMAIL_UNVERIFIED");
  if (decision === "UNAVAILABLE") throw new AuthError("ACCOUNT_UNAVAILABLE");
  throw new AuthError("AUTH_REQUIRED");
}
