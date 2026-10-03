import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamRoleRepositoryPort } from "../../ports/team-role-repository/team-role-repository.port";
import { teamRoleInputSchema } from "../../schemas/team-role-input/team-role-input.schema";
import { teamRoleDuplicate, teamRoleValidationFailure } from "../team-results/team-results";
import type { TeamRoleWriteResult } from "../team-results/team-results.types";

/**
 * Adds a workspace role after validating its name (BR-TEAM-005).
 * @param repository - the role repository
 * @param context - the verified workspace
 * @param actorId - the signed-in owner
 * @param input - the untrusted `{ name }`
 * @returns the created role, or the name error
 */
export async function addTeamRole(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  input: unknown,
): Promise<TeamRoleWriteResult> {
  const parsed = teamRoleInputSchema.safeParse(input);
  if (!parsed.success) return teamRoleValidationFailure(parsed.error.issues);
  const result = await repository.create(context, parsed.data.name, actorId);
  if (result.status === "DUPLICATE") return teamRoleDuplicate();
  return { ok: true, role: { id: result.id, name: parsed.data.name } };
}
