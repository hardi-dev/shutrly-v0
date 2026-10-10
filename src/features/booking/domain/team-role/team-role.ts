/** BR-TEAM-005: a role name is 1–50 characters after trimming, unique per workspace ignoring case. */
export const TEAM_ROLE_NAME_MAX_LENGTH = 50;

/** D-18: the stable identity of a platform-default role (migration 0021 CHECK list). */
export type DefaultTeamRoleKey = "PHOTOGRAPHER" | "VIDEOGRAPHER" | "ASSISTANT";

export interface DefaultTeamRole {
  readonly name: string;
  readonly defaultKey: DefaultTeamRoleKey;
}

/** BR-TEAM-005: every workspace starts with these roles; migration 0011 backfills them, 0021 keys them. */
export const DEFAULT_TEAM_ROLES: readonly DefaultTeamRole[] = [
  { name: "Fotografer", defaultKey: "PHOTOGRAPHER" },
  { name: "Videografer", defaultKey: "VIDEOGRAPHER" },
  { name: "Asisten", defaultKey: "ASSISTANT" },
];

/**
 * Tells whether a role name is within the length limit, counted in code points.
 * @param name - the trimmed role name
 * @returns true when it has at most `TEAM_ROLE_NAME_MAX_LENGTH` characters
 */
export function fitsTeamRoleNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_ROLE_NAME_MAX_LENGTH;
}
