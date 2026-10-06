// Matches project_token_ck: 32 random bytes in base64url (BR-PRJ-003).
const TOKEN_PATTERN = /^[\w-]{43}$/;

/**
 * Whether a URL segment can be a client access token at all, before any lookup (D-4).
 * @param value - the untrusted route parameter
 * @returns true for 43 base64url characters
 */
export function isWellFormedToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}
