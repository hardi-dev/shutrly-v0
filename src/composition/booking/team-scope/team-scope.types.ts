import type { TeamRoleRepositoryPort } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

export interface TeamScope {
  readonly roles: TeamRoleRepositoryPort;
}
