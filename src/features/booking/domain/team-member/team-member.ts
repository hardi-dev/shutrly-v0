/** BR-TEAM-004: a member name is 1–100 characters after trimming. */
export const TEAM_MEMBER_NAME_MAX_LENGTH = 100;
/** BR-TEAM-004: an optional email is at most 254 characters. */
export const TEAM_MEMBER_EMAIL_MAX_LENGTH = 254;
/** TD-A-4: bounds the untrusted role list; not a business rule. */
export const TEAM_MEMBER_ROLES_MAX = 50;
/** BR-TEAM-004: the list shows active or archived members. */
export const TEAM_MEMBER_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
/** A-3: members load 30 at a time. */
export const TEAM_PAGE_SIZE = 30;

/**
 * Tells whether a member name is within the length limit, counted in code points.
 * @param name - the trimmed member name
 * @returns true when it has at most `TEAM_MEMBER_NAME_MAX_LENGTH` characters
 */
export function fitsTeamMemberNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_MEMBER_NAME_MAX_LENGTH;
}
