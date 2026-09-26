import "server-only";

import { NextResponse } from "next/server";

import { AUTH_PATH } from "@/features/auth/application/policy/destination-path/destination-path";
import { continueAfterSignIn } from "@/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in";
import { startGoogleSignIn } from "@/features/auth/application/use-cases/start-google-sign-in/start-google-sign-in";

import { withAuthScope } from "../auth-scope/auth-scope";
import { applySetCookies } from "../session-cookies/session-cookies";

/**
 * Start Google sign-in (AC-AUTH-024): set Better Auth's OAuth state cookies.
 * @returns the Google authorization URL to redirect to
 */
export async function startGoogle(): Promise<string> {
  const { url, setCookies } = await withAuthScope((scope) => startGoogleSignIn(scope));
  await applySetCookies(setCookies);
  return url;
}

/**
 * Landing point after Google (GET /auth/continue): the status and verification gate, then the
 * F-02 hand-off (AC-AUTH-024, 026, 027, 031).
 * @param request - the request carrying the new session cookie
 * @returns a 303 to the destination, `/account-unavailable` or `/login`
 */
export function continueAfterGoogleResponse(request: Request): Promise<Response> {
  return withAuthScope(async (scope) => {
    const userId = await scope.identity.getSessionUserId(request.headers);
    const path = userId ? (await continueAfterSignIn(scope, userId)).path : AUTH_PATH.login;
    return NextResponse.redirect(new URL(path, request.url), 303);
  });
}
