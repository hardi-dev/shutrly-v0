import type { WorkspaceSourceRepositoryPort } from "@/features/gallery/application/ports/workspace-source-repository/workspace-source-repository.port";

export interface SourceConfigScope {
  readonly sources: WorkspaceSourceRepositoryPort;
}
