import "server-only";

import { cache } from "react";

import { resolveOwnerAccess } from "@/features/auth/application/policy/owner-access/owner-access";
import type { OwnerAccess } from "@/features/auth/application/policy/owner-access/owner-access.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * The session's access decision and account, read once per request and shared by the owner gate
 * and the owner-locale lookup (technical design R-2), so a page opens one auth scope for both.
 * @returns the access decision and the account, if any
 */
export const loadSessionAccess: () => Promise<OwnerAccess> = cache(() =>
  withAuthScope((scope) => resolveOwnerAccess(scope, scope.meta.headers)),
);
