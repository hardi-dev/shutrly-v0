import type { MessageTemplateRepositoryPort } from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import type { WorkspaceSourceRepositoryPort } from "@/features/gallery/application/ports/workspace-source-repository/workspace-source-repository.port";
import type { WorkspaceRepositoryPort } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";

export interface WorkspaceCreationScope {
  readonly repository: WorkspaceRepositoryPort;
  readonly templates: MessageTemplateRepositoryPort;
  readonly sources: WorkspaceSourceRepositoryPort;
}
