import type { ServiceOptionGroup } from "@/features/booking/application/ports/project-repository/project-repository.port";

export interface CreateProjectOptions {
  readonly serviceGroups: readonly ServiceOptionGroup[];
}
