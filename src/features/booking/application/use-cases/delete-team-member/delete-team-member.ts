import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";
import type { DeleteTeamMemberResult } from "../team-results/team-results.types";

/**
 * Deletes a member that has no assignment; one that has is reported so it can be archived instead (AC-TEAM-007).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param id - the member
 * @returns success, or `HAS_ASSIGNMENTS`; throws `NOT_FOUND` for a member outside the workspace
 */
export async function deleteTeamMember(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  id: string,
): Promise<DeleteTeamMemberResult> {
  const result = await repository.delete(context, id);
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  return result === "DELETED" ? { ok: true } : { ok: false, code: "HAS_ASSIGNMENTS" };
}
