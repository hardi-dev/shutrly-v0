import "server-only";

import { cookies } from "next/headers";

import { isLandingOnly } from "@/composition/app-stage/app-stage";
import { resolveOwnerAccess } from "@/features/auth/application/policy/owner-access/owner-access";
import type { AppLocale } from "@/shared/locale/locale.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * The signed-in owner's stored locale, for the account screens before and after sign-in (D-3).
 * Null on a landing-only production, without a session cookie, or for any session that is not
 * an active, verified owner. Only the locale is read: the gate itself stays in the owner pages.
 * @returns the owner's `user.locale`, or null
 */
export async function loadSignedInOwnerLocale(): Promise<AppLocale | null> {
  if (await isLandingOnly()) return null;
  const hasSession = (await cookies())
    .getAll()
    .some((cookie) => cookie.name.endsWith("session_token"));
  if (!hasSession) return null;
  return withAuthScope(async (scope) => {
    const { decision, account } = await resolveOwnerAccess(scope, scope.meta.headers);
    return decision === "OWNER" && account ? account.locale : null;
  });
}
