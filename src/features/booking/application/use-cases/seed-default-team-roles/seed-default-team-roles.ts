import "server-only";

import {
  DEFAULT_TEAM_ROLE_NAMES,
  DEFAULT_TEAM_ROLES,
} from "@/features/booking/domain/team-role/team-role";
import type { AppLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamRoleRepositoryPort } from "../../ports/team-role-repository/team-role-repository.port";

/**
 * Gives a new workspace the default team roles (BR-TEAM-005, AC-TEAM-008).
 * @param repository - the role repository, bound to the workspace-creation transaction
 * @param context - the new workspace
 * @param locale - the creating owner's language for the role names (D-18)
 * @returns once the roles exist
 */
export async function seedDefaultTeamRoles(
  repository: TeamRoleRepositoryPort,
  context: WorkspaceContext,
  locale: AppLocale,
): Promise<void> {
  await repository.seedDefaults(
    context,
    DEFAULT_TEAM_ROLES.map((role) => ({
      name: DEFAULT_TEAM_ROLE_NAMES[locale][role.defaultKey],
      defaultKey: role.defaultKey,
    })),
  );
}
