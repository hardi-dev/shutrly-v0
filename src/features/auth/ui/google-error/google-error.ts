import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

/**
 * Map Better Auth's `?error=` after a failed Google sign-in to a message code. Only a cancelled
 * consent is told apart; everything else is the generic Google failure (AC-AUTH-028/029).
 * @param error - the `error` query parameter, if any
 * @returns `GOOGLE_CANCELLED`, `GOOGLE_FAILED`, or null without an error
 */
export function googleErrorCode(error: string | undefined): AuthErrorCode | null {
  if (!error) return null;
  return error === "access_denied" ? "GOOGLE_CANCELLED" : "GOOGLE_FAILED";
}
