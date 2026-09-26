import "server-only";

import { NextResponse } from "next/server";

import {
  AUTH_PATH,
  DESTINATION_PATH,
} from "@/features/auth/application/policy/destination-path/destination-path";
import { resolveOwnerAccess } from "@/features/auth/application/policy/owner-access/owner-access";
import { verifyEmail } from "@/features/auth/application/use-cases/verify-email/verify-email";

import { withAuthScope } from "../auth-scope/auth-scope";
import {
  PENDING_EMAIL_COOKIE,
  readPendingEmail,
} from "../pending-email-cookie/pending-email-cookie";
import type { VerifyPageState } from "./verify-flow.types";

const INVALID_VERIFY_LINK = "/verify?state=invalid";

/**
 * The emailed verification link (GET /verify/confirm): verify, sign in, redirect (A-7).
 * @param request - the link request; its `token` query parameter is the link token
 * @returns a 303 to the destination with the session cookies, or to the invalid-link screen
 */
export function verifyEmailLinkResponse(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return withAuthScope(async (scope) => {
    const result = await verifyEmail(scope, token);
    const path = result.ok ? result.outcome.path : INVALID_VERIFY_LINK;
    const response = NextResponse.redirect(new URL(path, request.url), 303);
    if (!result.ok) return response;
    for (const cookie of result.setCookies) response.headers.append("set-cookie", cookie);
    response.cookies.delete(PENDING_EMAIL_COOKIE);
    return response;
  });
}

/**
 * Who may see Verification pending: a restricted session or a valid pending-email cookie.
 * A verified owner goes on to their destination; an unavailable one to its screen.
 * @returns where to redirect, or whether the resend control can work
 */
export function loadVerifyPage(): Promise<VerifyPageState> {
  return withAuthScope(async (scope) => {
    const { decision, account } = await resolveOwnerAccess(scope, scope.meta.headers);
    if (decision === "OWNER" && account) {
      const path = DESTINATION_PATH[await scope.destination.resolve(account.id)];
      return { kind: "REDIRECT", path };
    }
    if (decision === "UNAVAILABLE") return { kind: "REDIRECT", path: AUTH_PATH.unavailable };
    const canResend = decision === "RESTRICTED" || (await readPendingEmail(scope.secret)) !== null;
    return { kind: "SHOW", canResend };
  });
}
