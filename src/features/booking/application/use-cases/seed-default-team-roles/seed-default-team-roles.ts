import "server-only";

import { DEFAULT_TEAM_ROLES } from "@/features/booking/domain/team-role/team-role";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamRoleRepositoryPort } from "../../ports/team-role-repository/team-role-repository.port";

/**
 * Gives a new workspace the default team roles (BR-TEAM-005, AC-TEAM-008).
 * @param repository - the role repository, bound to the workspace-creation transaction
 * @param context - the new workspace
 * @returns once the roles exist
 */
export async function seedDefaultTeamRoles(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
): Promise<void> {
  await repository.seedDefaults(context, DEFAULT_TEAM_ROLES);
}
