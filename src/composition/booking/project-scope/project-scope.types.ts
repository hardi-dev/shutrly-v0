import type { AccessTokenGeneratorPort } from "@/features/booking/application/ports/access-token-generator/access-token-generator.port";
import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";

export interface ProjectScope {
  readonly projects: ProjectRepositoryPort;
  readonly accessTokens: AccessTokenGeneratorPort;
  readonly now: () => Date;
}
