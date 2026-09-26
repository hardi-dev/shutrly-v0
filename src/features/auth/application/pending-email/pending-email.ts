import "server-only";

/** SPEC GAP-3: how long the Verification pending screen can resend without a session. */
export const PENDING_EMAIL_TTL_SECONDS = 30 * 60;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

async function sign(payload: string, secret: string): Promise<string> {
  const algorithm = { name: "HMAC", hash: "SHA-256" };
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), algorithm, false, [
    "sign",
  ]);
  return toBase64Url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))),
  );
}

// Compares every character so the time taken doesn't reveal where a forged signature differs.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function decodeEmail(encoded: string): string | null {
  try {
    return fromBase64Url(encoded);
  } catch {
    return null;
  }
}

/**
 * Seal the registered email into a signed, expiring cookie value (SPEC GAP-3). Base64url is
 * an encoding, not encryption: the HMAC stops forgery, and the cookie is httpOnly.
 * @param email - the normalised email that just registered
 * @param secret - the app secret (`BETTER_AUTH_SECRET`)
 * @param now - the current time in ms, for tests
 * @returns `email.expiry.signature`
 */
export async function sealPendingEmail(
  email: string,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = `${toBase64Url(encoder.encode(email))}.${String(now + PENDING_EMAIL_TTL_SECONDS * 1000)}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * Open a sealed pending-email value, refusing forged, foreign, malformed or expired values.
 * @param value - the cookie value, if any
 * @param secret - the app secret used to seal it
 * @param now - the current time in ms, for tests
 * @returns the email, or null
 */
export async function openPendingEmail(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<string | null> {
  const [email, expires, signature, ...rest] = value?.split(".") ?? [];
  if (!email || !expires || !signature || rest.length > 0) return null;
  if (!constantTimeEqual(signature, await sign(`${email}.${expires}`, secret))) return null;
  const expiry = Number(expires);
  if (!Number.isFinite(expiry) || expiry <= now) return null;
  return decodeEmail(email);
}
