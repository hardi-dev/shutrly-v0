// The longest valid email address (RFC 5321 path limit); spec › Inputs.
export const WAITLIST_EMAIL_MAX_LENGTH = 254;

/**
 * Turn a typed email into the form the waitlist compares and stores (spec A-1).
 * @param email - the email as typed
 * @returns the email trimmed and lowercased
 */
export function normalizeWaitlistEmail(email: string): string {
  return email.trim().toLowerCase();
}
