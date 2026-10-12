import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { requireOwner } from "../../policy/owner-access/owner-access";
import { updateOwnerLocaleSchema } from "./update-owner-locale.schema";
import type { UpdateOwnerLocaleResult } from "./update-owner-locale.types";

/**
 * Store the signed-in owner's dashboard language on their own record (BR-L10N-001). The user ID
 * comes only from the session, never from the input (C-004, C-101).
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param headers - the request headers carrying the session cookie
 * @returns ok or a validation failure; throws `AuthError` for a non-owner session
 */
export async function updateOwnerLocale(
  deps: AuthDeps,
  input: unknown,
  headers: Headers,
): Promise<UpdateOwnerLocaleResult> {
  const owner = await requireOwner(deps, headers);
  const parsed = updateOwnerLocaleSchema.safeParse(input);
  // The language is chosen from a fixed control, so a bad value is a tampered request, not a field
  // the owner can correct: refuse it without a field message (no copy needed).
  if (!parsed.success) return failure("VALIDATION_FAILED", {});
  await deps.accounts.setLocale(owner.id, parsed.data.locale);
  authLog({
    operation: "update-locale",
    outcome: "UPDATED",
    userId: owner.id,
    requestId: deps.requestId,
  });
  return { ok: true };
}
