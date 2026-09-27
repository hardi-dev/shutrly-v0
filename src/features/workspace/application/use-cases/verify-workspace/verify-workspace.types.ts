import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceSummary } from "../../ports/workspace-repository/workspace-repository.port";

export interface VerifiedWorkspace {
  readonly context: WorkspaceContext;
  readonly workspace: WorkspaceSummary;
}
