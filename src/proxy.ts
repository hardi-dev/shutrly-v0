import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isLandingOnly } from "@/composition/app-stage/app-stage";

// Next 16 Proxy (formerly middleware): the production gate, then an early cookie-presence
// redirect. The owner guard in composition is the authority on every page, action and route
// (C-004).

// What production serves during the development phase (ADR-021, AC-LND-013): the landing page,
// its waitlist endpoint and its metadata files. Static assets never reach the proxy (matcher).
const LANDING_PATHS = ["/", "/api/waitlist", "/robots.txt"];
// Not a route, so a rewrite here renders the root not-found page with HTTP 404 (no redirect, A-5).
const NOT_FOUND_PATH = "/_gated";

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/account-unavailable",
  "/auth/continue",
  "/api/auth",
  "/api/health",
  "/api/test",
  "/api/waitlist",
  // F-10 client gallery: token + gallery password only, never an Owner session (BR-ACC-003).
  "/g",
];

/**
 * Tell whether a path is reachable without a session.
 * @param pathname - the request path
 * @returns true for the landing page and its waitlist endpoint, the auth screens, Better Auth's
 *   endpoints and the health/test routes
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

/**
 * Tell whether a path belongs to the landing page and stays served on production.
 * @param pathname - the request path
 * @returns true for the landing page, its waitlist endpoint and its metadata files
 */
export function isLandingPath(pathname: string): boolean {
  return LANDING_PATHS.includes(pathname);
}

/**
 * On a landing-only production, answer every other path with the not-found page; elsewhere, send
 * a request without any session cookie to `/login` before rendering an owner page.
 * @param request - the incoming request
 * @returns a not-found rewrite, a redirect to `/login`, or the request unchanged
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!isLandingPath(pathname) && (await isLandingOnly())) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }
  if (isPublicPath(pathname) || isLandingPath(pathname)) return NextResponse.next();
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.endsWith("session_token"));
  if (hasSession) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|auth/editorial/|landing/).*)"],
};
