import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { requireOwner } from "../../policy/owner-access/owner-access";
import { updateDisplayNameSchema } from "./update-display-name.schema";
import type { UpdateDisplayNameResult } from "./update-display-name.types";

/**
 * Change the owner's display name on the single user record; the email never changes
 * (AC-AUTH-020). It checks the owner itself, so a caller that forgets the guard is still safe.
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param headers - the request headers carrying the session cookie
 * @returns ok or a validation failure; throws `AuthError` for a non-owner session
 */
export async function updateDisplayName(
  deps: AuthDeps,
  input: unknown,
  headers: Headers,
): Promise<UpdateDisplayNameResult> {
  const owner = await requireOwner(deps, headers);
  const parsed = updateDisplayNameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  await deps.identity.updateName(parsed.data.name, headers);
  const event = { operation: "update-profile", outcome: "UPDATED", userId: owner.id } as const;
  authLog({ ...event, requestId: deps.requestId });
  return { ok: true };
}
