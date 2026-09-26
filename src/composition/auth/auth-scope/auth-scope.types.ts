import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";

export interface AuthScope extends AuthDeps {
  meta: RequestMeta;
  /** Signs app-level cookies (the pending-email cookie). */
  secret: string;
  /** Better Auth's own endpoints (`/api/auth/*`). */
  handler: (request: Request) => Promise<Response>;
}
