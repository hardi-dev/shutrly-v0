import "server-only";

import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";

/**
 * Counts the workspace's members of one status, ignoring any search (AC-TEAM-001).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param status - active or archived
 * @returns the number of members
 */
export function countTeamMembers(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  status: TeamMemberStatus,
): Promise<number> {
  return repository.count(context, status);
}
