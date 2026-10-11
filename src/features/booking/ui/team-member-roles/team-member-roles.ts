import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import { displayTeamRoleName } from "@/features/booking/domain/team-role/team-role";
import type { AppLocale } from "@/shared/locale/locale.types";

/**
 * Joins a member's role names for a row, in the order the repository returned them (TD-A-1).
 * @param roles - the member's roles
 * @param locale - the locale the row is rendered in (D-18)
 * @returns the names separated by a comma, e.g. `Fotografer, Videografer`
 */
export function memberRolesLabel(roles: readonly RoleRef[], locale: AppLocale): string {
  return roles.map((role) => displayTeamRoleName(role, locale)).join(", ");
}
