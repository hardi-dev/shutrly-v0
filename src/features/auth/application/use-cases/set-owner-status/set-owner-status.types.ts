import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export interface SetOwnerStatusInput {
  email: string;
  status: string;
}

export type SetOwnerStatusDeps = Pick<AuthDeps, "accounts" | "requestId">;

export type SetOwnerStatusResult =
  { ok: true; userId: AuthUserId } | { ok: false; reason: "UNKNOWN_STATUS" | "NOT_FOUND" };
