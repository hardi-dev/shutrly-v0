import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";

/**
 * Archives or restores a member within the verified workspace; repeating it changes nothing (AC-TEAM-007).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param editorUserId - the Owner making the change
 * @param id - the member
 * @param isArchived - true to archive, false to restore
 * @returns nothing; throws `NOT_FOUND` for a member outside the workspace
 */
export async function setTeamMemberArchived(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  id: string,
  isArchived: boolean,
): Promise<void> {
  const updated = await repository.setArchived(context, { id, isArchived, editorUserId });
  if (!updated) throw new TeamError("NOT_FOUND");
}
