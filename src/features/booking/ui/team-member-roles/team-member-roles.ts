import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

/**
 * Joins a member's role names for a row, in the order the repository returned them (TD-A-1).
 * @param roles - the member's roles
 * @returns the names separated by a comma, e.g. `Fotografer, Videografer`
 */
export function memberRolesLabel(roles: readonly RoleRef[]): string {
  return roles.map((role) => role.name).join(", ");
}
