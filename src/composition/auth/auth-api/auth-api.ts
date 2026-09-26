import "server-only";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * Better Auth's own endpoints under `/api/auth/*`, including the Google callback.
 * @param request - the incoming request
 * @returns Better Auth's response
 */
export function handleAuthRequest(request: Request): Promise<Response> {
  return withAuthScope((scope) => scope.handler(request));
}
