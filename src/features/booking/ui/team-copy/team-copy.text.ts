import type { TeamTranslate } from "./team-copy.types";

/**
 * The usage cell of a role: how many members use it, or that none do yet (deck §8.2).
 * @param t - the team translator
 * @param count - the members using the role
 * @returns the usage label
 */
export function teamUsageText(t: TeamTranslate, count: number): string {
  return count > 0 ? t("usageMembers", { count }) : t("usageUnused");
}
