import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { TeamMemberPage } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface TeamMembersData {
  readonly status: TeamMemberStatus;
  readonly q: string;
  readonly page: TeamMemberPage;
  readonly count: number;
  readonly roles: readonly TeamRoleRecord[];
}
