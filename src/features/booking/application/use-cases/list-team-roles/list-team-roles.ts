import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  TeamRoleRecord,
  TeamRoleRepositoryPort,
} from "../../ports/team-role-repository/team-role-repository.port";

/**
 * Lists the workspace's team roles with how many members use each (AC-TEAM-009).
 * @param repository - the role repository
 * @param context - the verified workspace
 * @returns the roles ordered by name
 */
export function listTeamRoles(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly TeamRoleRecord[]> {
  return repository.list(context);
}
