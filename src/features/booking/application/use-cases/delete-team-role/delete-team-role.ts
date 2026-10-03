import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamRoleRepositoryPort } from "../../ports/team-role-repository/team-role-repository.port";
import type { DeleteTeamRoleResult } from "../team-results/team-results.types";

/**
 * Deletes a role only while no member holds it and no assignment uses it (BR-TEAM-005).
 * @param repository - the role repository
 * @param context - the verified workspace
 * @param id - the role to delete
 * @returns success, or `IN_USE` with how many members use it
 * @throws TeamError NOT_FOUND when the role is not in the workspace
 */
export async function deleteTeamRole(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
  id: string,
): Promise<DeleteTeamRoleResult> {
  const result = await repository.delete(context, id);
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  return result === "DELETED" ? { ok: true } : { ok: false, code: "IN_USE", usage: result.usage };
}
