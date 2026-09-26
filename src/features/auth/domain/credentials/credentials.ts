import { normalisedEmailSchema } from "./credentials.schema";
import type { NormalisedEmail, PasswordCheck } from "./credentials.types";

/** A-1: the shortest accepted password. */
export const PASSWORD_MIN_LENGTH = 8;
/** A-1: the longest accepted password. */
export const PASSWORD_MAX_LENGTH = 128;
/** Spec › Inputs: the longest display name. */
export const DISPLAY_NAME_MAX_LENGTH = 100;

/**
 * Trim and lower-case an email so one address maps to one identity (BR-AUTH-002).
 * @param raw - the email as typed
 * @returns the branded normalised email
 */
export function normaliseEmail(raw: string): NormalisedEmail {
  return normalisedEmailSchema.parse(raw);
}

/**
 * Check a new password against A-1: length only, no composition rules. Length is
 * `string.length` (UTF-16 units), the same measure Better Auth applies.
 * @param password - the candidate password
 * @returns `OK`, `TOO_SHORT` or `TOO_LONG`
 */
export function checkPassword(password: string): PasswordCheck {
  if (password.length < PASSWORD_MIN_LENGTH) return "TOO_SHORT";
  if (password.length > PASSWORD_MAX_LENGTH) return "TOO_LONG";
  return "OK";
}
