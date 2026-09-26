import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Next 16 Proxy (formerly middleware): an early cookie-presence redirect only. The owner guard
// in composition is the authority on every page, action and route (C-004).
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
];

/**
 * Tell whether a path is reachable without a session.
 * @param pathname - the request path
 * @returns true for the auth screens, Better Auth's endpoints and the health/test routes
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

/**
 * Send a request without any session cookie to `/login` before rendering an owner page.
 * @param request - the incoming request
 * @returns a redirect to `/login`, or the request unchanged
 */
export function proxy(request: NextRequest): NextResponse {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.endsWith("session_token"));
  if (hasSession) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|auth/editorial/).*)"],
};
