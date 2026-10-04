import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamRoleRepositoryPort } from "../../ports/team-role-repository/team-role-repository.port";
import { teamRoleInputSchema } from "../../schemas/team-role-input/team-role-input.schema";
import { teamRoleDuplicate, teamRoleValidationFailure } from "../team-results/team-results";
import type { TeamRoleWriteResult } from "../team-results/team-results.types";

/**
 * Renames a workspace role; members and assignments follow because they hold its ID (AC-TEAM-009).
 * @param repository - the role repository
 * @param context - the verified workspace
 * @param id - the role to rename
 * @param actorId - the signed-in owner
 * @param input - the untrusted `{ name }`
 * @returns success, or the name error
 * @throws TeamError NOT_FOUND when the role is not in the workspace
 */
export async function renameTeamRole(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
  id: string,
  actorId: string,
  input: unknown,
): Promise<TeamRoleWriteResult> {
  const parsed = teamRoleInputSchema.safeParse(input);
  if (!parsed.success) return teamRoleValidationFailure(parsed.error.issues);
  const result = await repository.rename(context, id, parsed.data.name, actorId);
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  return result === "UPDATED" ? { ok: true } : teamRoleDuplicate();
}
