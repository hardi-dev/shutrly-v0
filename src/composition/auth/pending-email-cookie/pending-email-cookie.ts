import "server-only";

import { cookies } from "next/headers";

import {
  openPendingEmail,
  PENDING_EMAIL_TTL_SECONDS,
  sealPendingEmail,
} from "@/features/auth/application/pending-email/pending-email";

/** SPEC GAP-3: identifies the just-registered email so Verification pending can resend. */
export const PENDING_EMAIL_COOKIE = "shutrly_pending_email";

/**
 * Store the sealed email in a short-lived, httpOnly cookie.
 * @param email - the normalised email that just registered
 * @param secret - the app secret
 * @returns nothing
 */
export async function writePendingEmail(email: string, secret: string): Promise<void> {
  (await cookies()).set({
    name: PENDING_EMAIL_COOKIE,
    value: await sealPendingEmail(email, secret),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_EMAIL_TTL_SECONDS,
  });
}

/**
 * Read and verify the pending-email cookie of this request.
 * @param secret - the app secret
 * @returns the email, or null when missing, forged or expired
 */
export async function readPendingEmail(secret: string): Promise<string | null> {
  return openPendingEmail((await cookies()).get(PENDING_EMAIL_COOKIE)?.value, secret);
}

/**
 * Delete the pending-email cookie once it is no longer needed (verified or signed out).
 * @returns nothing
 */
export async function clearPendingEmail(): Promise<void> {
  (await cookies()).delete(PENDING_EMAIL_COOKIE);
}
