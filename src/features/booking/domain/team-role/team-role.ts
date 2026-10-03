/** BR-TEAM-005: a role name is 1–50 characters after trimming, unique per workspace ignoring case. */
export const TEAM_ROLE_NAME_MAX_LENGTH = 50;

/** BR-TEAM-005: every workspace starts with these roles; migration 0011 backfills them. */
export const DEFAULT_TEAM_ROLES = ["Fotografer", "Videografer", "Asisten"] as const;

/**
 * Tells whether a role name is within the length limit, counted in code points.
 * @param name - the trimmed role name
 * @returns true when it has at most `TEAM_ROLE_NAME_MAX_LENGTH` characters
 */
export function fitsTeamRoleNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_ROLE_NAME_MAX_LENGTH;
}
