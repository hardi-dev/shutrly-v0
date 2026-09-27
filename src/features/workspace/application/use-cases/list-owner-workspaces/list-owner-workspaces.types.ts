import type { WorkspaceSummary } from "../../ports/workspace-repository/workspace-repository.port";

export interface ListedWorkspace extends WorkspaceSummary {
  readonly isCurrent: boolean;
}
