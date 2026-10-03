import { TEAM_COPY } from "../team-copy/team-copy.copy";

/**
 * Maps a role-name validation key to its Indonesian field feedback.
 * @param key - a stable key from the schema or the server
 * @returns the message to show under the field
 */
export function teamRoleErrorText(key: string): string {
  if (key === "TOO_LONG") return TEAM_COPY.roleErrors.TOO_LONG;
  if (key === "DUPLICATE") return TEAM_COPY.roleErrors.DUPLICATE;
  return TEAM_COPY.roleErrors.EMPTY;
}
