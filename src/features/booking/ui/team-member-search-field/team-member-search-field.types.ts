import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface TeamMemberSearchFieldProps {
  readonly workspaceId: string;
  readonly status: TeamMemberStatus;
  readonly q: string;
  readonly resultCount: number;
}
