import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { GallerySourceRepositoryPort } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface FinalDeliveryScope {
  readonly projects: ProjectRepositoryPort;
  readonly sources: GallerySourceRepositoryPort;
  readonly now: Date;
}

export interface FinalDeliveryTarget {
  readonly context: WorkspaceContext;
  readonly actorId: string;
  readonly projectId: string;
}
