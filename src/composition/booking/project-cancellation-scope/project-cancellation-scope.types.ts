import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { GallerySourceRepositoryPort } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";

export interface ProjectCancellationScope {
  readonly projects: ProjectRepositoryPort;
  readonly galleries: GallerySourceRepositoryPort;
  readonly now: Date;
}
