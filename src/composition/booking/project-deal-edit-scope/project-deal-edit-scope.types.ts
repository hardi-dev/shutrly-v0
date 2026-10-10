import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { SelectionRepositoryPort } from "@/features/gallery/application/ports/selection-repository/selection-repository.port";

export interface ProjectDealEditScope {
  readonly projects: ProjectRepositoryPort;
  readonly selections: SelectionRepositoryPort;
}
