import {
  DEFAULT_TEAM_ROLES,
  type DefaultTeamRole,
} from "@/features/booking/domain/team-role/team-role";

/**
 * Picks the platform-default roles with these names, keeping their keys (D-18), for tests.
 * @param names - default role names
 * @returns the matching default roles in default order
 */
export function defaultRolesNamed(names: readonly string[]): readonly DefaultTeamRole[] {
  return DEFAULT_TEAM_ROLES.filter((role) => names.includes(role.name));
}
