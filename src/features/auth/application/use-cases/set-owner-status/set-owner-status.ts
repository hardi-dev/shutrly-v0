import "server-only";

import { isAccountStatus } from "@/features/auth/domain/account/account";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { authLog } from "../../logging/auth-log/auth-log";
import type {
  SetOwnerStatusDeps,
  SetOwnerStatusInput,
  SetOwnerStatusResult,
} from "./set-owner-status.types";

/**
 * Operator-only status change (BR-AUTH-005): set the status and revoke every session in one
 * transaction. There is no in-app caller; `scripts/set-user-status.ts` runs it.
 * @param deps - the account directory and a request ID for the log
 * @param input - the owner's email and the new status
 * @returns the changed user, or why nothing changed
 */
export async function setOwnerStatus(
  deps: SetOwnerStatusDeps,
  input: SetOwnerStatusInput,
): Promise<SetOwnerStatusResult> {
  if (!isAccountStatus(input.status)) return { ok: false, reason: "UNKNOWN_STATUS" };
  const found = await deps.accounts.findByEmail(normaliseEmail(input.email));
  if (!found) return { ok: false, reason: "NOT_FOUND" };
  await deps.accounts.setStatusAndRevokeSessions(found.id, input.status);
  const event = { operation: "operator-status", outcome: input.status, userId: found.id } as const;
  authLog({ ...event, requestId: deps.requestId }, "warn");
  return { ok: true, userId: found.id };
}
