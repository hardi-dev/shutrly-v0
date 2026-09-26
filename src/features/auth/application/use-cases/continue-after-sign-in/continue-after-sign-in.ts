import "server-only";

import { accessDecision } from "@/features/auth/domain/account/account";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import { authLog } from "../../logging/auth-log/auth-log";
import { AUTH_PATH, DESTINATION_PATH } from "../../policy/destination-path/destination-path";
import type { ContinueDeps, SignInOutcome } from "./continue-after-sign-in.types";

/**
 * Decide where a new session goes, after every way of signing in (password, verification link,
 * Google). A non-active owner keeps no session (BR-AUTH-005, AC-AUTH-013/031).
 * @param deps - the account directory, the F-02 destination port and a request ID
 * @param userId - the user the session belongs to
 * @returns the F-02 destination, `/verify` or `/account-unavailable`
 */
export async function continueAfterSignIn(
  deps: ContinueDeps,
  userId: AuthUserId,
): Promise<SignInOutcome> {
  const decision = accessDecision(await deps.accounts.getById(userId));
  if (decision === "OWNER") {
    return { kind: "OWNER", path: DESTINATION_PATH[await deps.destination.resolve(userId)] };
  }
  if (decision === "RESTRICTED") return { kind: "RESTRICTED", path: AUTH_PATH.verify };
  await deps.accounts.revokeAllSessions(userId);
  const event = { operation: "access-gate", outcome: "UNAVAILABLE", userId } as const;
  authLog({ ...event, requestId: deps.requestId }, "warn");
  return { kind: "UNAVAILABLE", path: AUTH_PATH.unavailable };
}
