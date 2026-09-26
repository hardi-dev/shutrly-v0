import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";

// SPEC GAP-2: F-02 implements this port; until then composition wires a stub (ONBOARDING).
export type OwnerDestination = "ONBOARDING" | "WORKSPACE";

/** Where a signed-in owner goes next: first-workspace creation or their workspace (BR-AUTH-004). */
export interface WorkspaceDestinationPort {
  resolve: (userId: AuthUserId) => Promise<OwnerDestination>;
}
