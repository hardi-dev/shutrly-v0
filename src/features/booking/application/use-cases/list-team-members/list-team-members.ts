import "server-only";

import { clientSearchSchema } from "@/features/booking/domain/client-search/client-search.schema";
import { TEAM_PAGE_SIZE } from "@/features/booking/domain/team-member/team-member";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";
import type { TeamMemberListQuery } from "../../schemas/team-member-list-query/team-member-list-query.types";
import type { TeamMemberPage } from "../team-results/team-results.types";

/**
 * Lists one page of the workspace's members, searched by name or number (AC-TEAM-001, AC-TEAM-003).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param query - the status, the raw search text and the keyset cursor
 * @returns up to a page of members and the cursor of the next page
 */
export async function listTeamMembers(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  query: TeamMemberListQuery,
): Promise<TeamMemberPage> {
  const rows = await repository.listPage(context, {
    status: query.status,
    search: clientSearchSchema.safeParse(query.q).data ?? null,
    afterId: query.afterId,
    limit: TEAM_PAGE_SIZE + 1,
  });
  return {
    items: rows.slice(0, TEAM_PAGE_SIZE),
    nextCursor: rows.length > TEAM_PAGE_SIZE ? (rows.at(TEAM_PAGE_SIZE - 1)?.id ?? null) : null,
  };
}
