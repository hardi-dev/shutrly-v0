import type { TeamMemberPage } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface TeamMembersScreenProps {
  readonly workspaceId: string;
  readonly status: TeamMemberStatus;
  /** The tab's member count, which ignores the search (D-7). */
  readonly count: number;
  readonly q: string;
  readonly initialPage: TeamMemberPage;
  readonly loadMoreAction: (workspaceId: string, query: unknown) => Promise<TeamMemberPage>;
}

export interface LoadMoreButtonProps {
  readonly isLoading: boolean;
  readonly onLoadMore: () => Promise<void>;
}
