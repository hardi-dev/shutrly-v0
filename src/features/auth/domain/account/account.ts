import { accountStatusSchema, authUserIdSchema } from "./account.schema";
import type {
  AccessDecision,
  AccessSubject,
  AccountStatus,
  AuthUserId,
  GoogleLinkDecision,
  GoogleLinkInput,
} from "./account.types";

/** The three account statuses (BR-AUTH-005). */
export const ACCOUNT_STATUSES = accountStatusSchema.options;

/**
 * Brand a Better Auth user ID. It checks only that the ID is non-empty; the ID stays opaque.
 * @param raw - the user ID from Better Auth or the database
 * @returns the branded `AuthUserId`
 */
export function asAuthUserId(raw: string): AuthUserId {
  return authUserIdSchema.parse(raw);
}

/**
 * Tell whether a stored or typed value is one of the account statuses.
 * @param value - the raw status
 * @returns true for `ACTIVE`, `SUSPENDED` or `DISABLED`
 */
export function isAccountStatus(value: string): value is AccountStatus {
  return accountStatusSchema.safeParse(value).success;
}

/**
 * Decide what a session may do. Status is checked before verification (BR-AUTH-005, then
 * BR-AUTH-003), as in diagrams/state.md.
 * @param account - the session's account, or null without one
 * @returns `ANONYMOUS`, `UNAVAILABLE`, `RESTRICTED` or `OWNER`
 */
export function accessDecision(account: AccessSubject | null): AccessDecision {
  if (!account) return "ANONYMOUS";
  if (account.status !== "ACTIVE") return "UNAVAILABLE";
  if (!account.emailVerified) return "RESTRICTED";
  return "OWNER";
}

/**
 * Decide how a Google sign-in relates to a local account (BR-AUTH-006, BR-AUTH-007).
 * @param input - Google's `email_verified` claim and the local account with that email
 * @returns `REJECT`, `CREATE`, `LINK` or `LINK_WITH_TAKEOVER_GUARD`
 */
export function googleLinkDecision(input: GoogleLinkInput): GoogleLinkDecision {
  if (!input.googleEmailVerified) return "REJECT";
  if (!input.existing) return "CREATE";
  return input.existing.emailVerified ? "LINK" : "LINK_WITH_TAKEOVER_GUARD";
}
