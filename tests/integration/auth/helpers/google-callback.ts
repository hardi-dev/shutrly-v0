import { vi } from "vitest";

import type { AuthHarness } from "./auth-harness";
import { cookieHeaders } from "./auth-harness";

export interface GoogleTestClaims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export interface CallbackResult {
  path: string;
  error: string | null;
  setCookies: string[];
}

const base64Url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

// Better Auth 1.7.6 decodes (does not re-verify) the ID token that Google's token endpoint
// returns over TLS. If an upgrade changes that, this helper is the one place to adapt.
function idToken(claims: GoogleTestClaims, audience: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://accounts.google.com",
    aud: audience,
    iat: now,
    exp: now + 3600,
    ...claims,
  };
  return `${base64Url({ alg: "RS256", typ: "JWT" })}.${base64Url(payload)}.sig`;
}

/**
 * Drive Better Auth's real Google callback, replacing only Google's token endpoint.
 * @param h - the auth harness
 * @param claims - the ID-token claims, or "cancel" for a denied consent
 * @returns where Better Auth redirected, its `error`, and the cookies it set
 */
export async function googleCallback(
  h: AuthHarness,
  claims: GoogleTestClaims | "cancel",
): Promise<CallbackResult> {
  const redirects = { callbackURL: "/auth/continue", errorCallbackURL: "/login" };
  const start = await h.deps.identity.googleSignInUrl(redirects);
  const state = new URL(start.url).searchParams.get("state") ?? "";
  const query =
    claims === "cancel" ? `error=access_denied&state=${state}` : `code=test-code&state=${state}`;
  const realFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (claims === "cancel" || !url.startsWith("https://oauth2.googleapis.com/token")) {
      return realFetch(input, init);
    }
    const body = { access_token: "ya29.test", id_token: idToken(claims, h.env.GOOGLE_CLIENT_ID) };
    return Promise.resolve(Response.json({ ...body, expires_in: 3600, token_type: "Bearer" }));
  });
  try {
    const url = `${h.env.BETTER_AUTH_URL}/api/auth/callback/google?${query}`;
    const response = await h.handler(
      new Request(url, { headers: cookieHeaders(start.setCookies) }),
    );
    const location = new URL(response.headers.get("location") ?? "/", h.env.BETTER_AUTH_URL);
    const error = location.searchParams.get("error");
    return { path: location.pathname, error, setCookies: response.headers.getSetCookie() };
  } finally {
    vi.unstubAllGlobals();
  }
}
