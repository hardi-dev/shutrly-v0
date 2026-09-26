import type { AccessDecision, AccountRecord } from "@/features/auth/domain/account/account.types";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export type OwnerAccessDeps = Pick<AuthDeps, "identity" | "accounts">;

export interface OwnerAccess {
  decision: AccessDecision;
  account: AccountRecord | null;
}
