import type { TeamMemberPage } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface UseLoadMoreTeamMembersProps {
  readonly workspaceId: string;
  readonly status: TeamMemberStatus;
  readonly q: string;
  readonly initial: TeamMemberPage;
  readonly action: (workspaceId: string, query: unknown) => Promise<TeamMemberPage>;
}
