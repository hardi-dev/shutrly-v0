import "server-only";

import { cookies } from "next/headers";

import { isLandingOnly } from "@/composition/app-stage/app-stage";
import type { AppLocale } from "@/shared/locale/locale.types";
import { logger } from "@/shared/logging/logger";

import { loadSessionAccess } from "../session-access/session-access";

/**
 * The signed-in owner's stored locale, for the account screens before and after sign-in (D-3).
 * Null on a landing-only production, without a session cookie, or for any session that is not
 * an active, verified owner. Only the locale is read: the gate itself stays in the owner pages.
 * A failed session lookup is logged and treated as no owner locale, so a display preference never
 * fails the page; the owner gate still reports the failure on owner pages.
 * @returns the owner's `user.locale`, or null
 */
export async function loadSignedInOwnerLocale(): Promise<AppLocale | null> {
  if (await isLandingOnly()) return null;
  const hasSession = (await cookies())
    .getAll()
    .some((cookie) => cookie.name.endsWith("session_token"));
  if (!hasSession) return null;
  try {
    const { decision, account } = await loadSessionAccess();
    return decision === "OWNER" && account ? account.locale : null;
  } catch {
    logger.error("l10n.owner_locale_failed", {});
    return null;
  }
}
