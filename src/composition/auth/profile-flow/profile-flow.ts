import "server-only";

import { changePassword } from "@/features/auth/application/use-cases/change-password/change-password";
import type { ChangePasswordResult } from "@/features/auth/application/use-cases/change-password/change-password.types";
import { updateDisplayName } from "@/features/auth/application/use-cases/update-display-name/update-display-name";
import type { UpdateDisplayNameResult } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import { withAuthScope } from "../auth-scope/auth-scope";
import { redirectOnRefusal, requireOwnerOrRedirect } from "../owner-guard/owner-guard";
import { applySetCookies } from "../session-cookies/session-cookies";
import type { ProfileView } from "./profile-flow.types";

/**
 * The Profile page's data, behind the owner gate (C-004). Only what the page shows.
 * @returns the owner's email, name and whether they have a password (BR-AUTH-008)
 */
export async function loadProfile(): Promise<ProfileView> {
  const { email, name, hasPassword } = await requireOwnerOrRedirect();
  return { email, name, hasPassword };
}

/**
 * Update the display name (AC-AUTH-020); a non-owner session is redirected.
 * @param values - the untrusted Profile form values
 * @returns the use-case result
 */
export function updateProfileName(values: unknown): Promise<UpdateDisplayNameResult> {
  return redirectOnRefusal(() =>
    withAuthScope((scope) => updateDisplayName(scope, values, scope.meta.headers)),
  );
}

/**
 * Change the password (AC-AUTH-019) and keep this session's refreshed cookies.
 * @param values - the untrusted Change password form values
 * @returns the use-case result
 */
export async function changeOwnPassword(values: unknown): Promise<ChangePasswordResult> {
  const result = await redirectOnRefusal(() =>
    withAuthScope((scope) => changePassword(scope, values, scope.meta.headers)),
  );
  if (result.ok) await applySetCookies(result.setCookies);
  return result;
}
