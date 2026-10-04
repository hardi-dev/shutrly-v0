import { describe, expect, it } from "vitest";

import { DEFAULT_TEAM_ROLES, fitsTeamRoleNameLength, TEAM_ROLE_NAME_MAX_LENGTH } from "./team-role";
import { teamRoleNameSchema } from "./team-role.schema";

function issueOf(value: string): string | undefined {
  const result = teamRoleNameSchema.safeParse(value);
  return result.success ? undefined : result.error.issues.at(0)?.message;
}

describe("team role name", () => {
  it("BR-TEAM-005 trims the name", () => {
    expect(teamRoleNameSchema.parse("  Fotografer  ")).toBe("Fotografer");
  });

  it("BR-TEAM-005 rejects a blank name as EMPTY", () => {
    expect(issueOf("   ")).toBe("EMPTY");
    expect(issueOf("")).toBe("EMPTY");
  });

  it("BR-TEAM-005 allows 50 code points and rejects 51 as TOO_LONG", () => {
    expect(teamRoleNameSchema.safeParse("a".repeat(TEAM_ROLE_NAME_MAX_LENGTH)).success).toBe(true);
    expect(issueOf("a".repeat(TEAM_ROLE_NAME_MAX_LENGTH + 1))).toBe("TOO_LONG");
  });

  it("BR-TEAM-005 counts code points, not UTF-16 units", () => {
    expect(fitsTeamRoleNameLength("😀".repeat(TEAM_ROLE_NAME_MAX_LENGTH))).toBe(true);
    expect(fitsTeamRoleNameLength("😀".repeat(TEAM_ROLE_NAME_MAX_LENGTH + 1))).toBe(false);
  });

  it("BR-TEAM-005 seeds Fotografer, Videografer and Asisten", () => {
    expect(DEFAULT_TEAM_ROLES).toEqual(["Fotografer", "Videografer", "Asisten"]);
  });
});
