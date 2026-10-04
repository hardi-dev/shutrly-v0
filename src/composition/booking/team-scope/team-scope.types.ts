import type { SessionAssignmentRepositoryPort } from "@/features/booking/application/ports/session-assignment-repository/session-assignment-repository.port";
import type { TeamMemberRepositoryPort } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { TeamRoleRepositoryPort } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

export interface TeamScope {
  readonly roles: TeamRoleRepositoryPort;
  readonly members: TeamMemberRepositoryPort;
  readonly assignments: SessionAssignmentRepositoryPort;
}
