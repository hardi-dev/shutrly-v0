import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface TeamRoleRepositoryPort {
  /** Inserts the named roles a workspace lacks, ignoring case; idempotent (BR-TEAM-005). */
  readonly seedDefaults: (context: WorkspaceContext, names: readonly string[]) => Promise<void>;
}
