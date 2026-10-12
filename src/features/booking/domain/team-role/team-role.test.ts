import { describe, expect, it } from "vitest";

import {
  DEFAULT_TEAM_ROLES,
  displayTeamRoleName,
  fitsTeamRoleNameLength,
  localizeTeamRole,
  parseDefaultTeamRoleKey,
  TEAM_ROLE_NAME_MAX_LENGTH,
  teamRoleSubmissionName,
} from "./team-role";
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
    expect(DEFAULT_TEAM_ROLES.map(({ name }) => name)).toEqual([
      "Fotografer",
      "Videografer",
      "Asisten",
    ]);
    expect(DEFAULT_TEAM_ROLES.map(({ defaultKey }) => defaultKey)).toEqual([
      "PHOTOGRAPHER",
      "VIDEOGRAPHER",
      "ASSISTANT",
    ]);
  });
});

describe("displayTeamRoleName (D-18)", () => {
  it("D-18 a keyed default shows the English label in en", () => {
    expect(displayTeamRoleName({ name: "Fotografer", defaultKey: "PHOTOGRAPHER" }, "en")).toBe(
      "Photographer",
    );
  });

  it("D-18 a keyed default shows the Indonesian label in id", () => {
    expect(displayTeamRoleName({ name: "Fotografer", defaultKey: "PHOTOGRAPHER" }, "id")).toBe(
      "Fotografer",
    );
  });

  it("D-18 a renamed role shows its stored name", () => {
    expect(displayTeamRoleName({ name: "Editor", defaultKey: null }, "en")).toBe("Editor");
  });
});

describe("parseDefaultTeamRoleKey (D-18)", () => {
  it("D-18 narrows a stored key and rejects owner or unknown values", () => {
    expect(parseDefaultTeamRoleKey("ASSISTANT")).toBe("ASSISTANT");
    expect(parseDefaultTeamRoleKey(null)).toBeNull();
    expect(parseDefaultTeamRoleKey("OTHER")).toBeNull();
  });
});

describe("localizeTeamRole (D-18)", () => {
  it("D-18 a keyed role keeps its id and shows the locale's name", () => {
    expect(
      localizeTeamRole({ id: "r1", name: "Fotografer", defaultKey: "PHOTOGRAPHER" }, "en"),
    ).toEqual({ id: "r1", name: "Photographer", defaultKey: "PHOTOGRAPHER" });
  });
});

describe("teamRoleSubmissionName (D-18)", () => {
  it("D-18 saving the unchanged English label submits the stored name", () => {
    const role = { name: "Fotografer", defaultKey: "PHOTOGRAPHER" as const };
    expect(teamRoleSubmissionName(role, "en", "Photographer")).toBe("Fotografer");
    expect(teamRoleSubmissionName(role, "en", "Lead photographer")).toBe("Lead photographer");
  });
});
