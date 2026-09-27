import type { WorkspaceRepositoryPort } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";

export interface WorkspaceScope {
  readonly repository: WorkspaceRepositoryPort;
}
