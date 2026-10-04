import { describe, expect, it } from "vitest";

import { fitsTeamMemberNameLength, TEAM_MEMBER_NAME_MAX_LENGTH } from "./team-member";
import {
  optionalEmailSchema,
  requiredWhatsappNumberSchema,
  roleIdsSchema,
  teamMemberNameSchema,
} from "./team-member.schema";

const ROLE_A = "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11";
const ROLE_B = "0b7d5c0c-2f7e-4a1b-9c7e-5a3c1f2d9e22";

function issueOf(
  schema: { safeParse: (value: string) => unknown },
  value: string,
): string | undefined {
  const result = schema.safeParse(value) as {
    success: boolean;
    error?: { issues: { message: string }[] };
  };
  return result.success ? undefined : result.error?.issues.at(0)?.message;
}

describe("team member name", () => {
  it("AC-TEAM-004 trims the name", () => {
    expect(teamMemberNameSchema.parse("  Rina  ")).toBe("Rina");
  });

  it("AC-TEAM-005 rejects an empty name as EMPTY", () => {
    expect(issueOf(teamMemberNameSchema, "   ")).toBe("EMPTY");
  });

  it("AC-TEAM-005 allows 100 code points and rejects 101 as TOO_LONG", () => {
    expect(teamMemberNameSchema.safeParse("a".repeat(TEAM_MEMBER_NAME_MAX_LENGTH)).success).toBe(
      true,
    );
    expect(issueOf(teamMemberNameSchema, "a".repeat(TEAM_MEMBER_NAME_MAX_LENGTH + 1))).toBe(
      "TOO_LONG",
    );
    expect(fitsTeamMemberNameLength("😀".repeat(TEAM_MEMBER_NAME_MAX_LENGTH))).toBe(true);
  });
});

describe("team member WhatsApp number", () => {
  it("AC-TEAM-004 normalizes 0812-3456-7890 to 6281234567890", () => {
    expect(requiredWhatsappNumberSchema.parse("0812-3456-7890")).toBe("6281234567890");
  });

  it("AC-TEAM-005 reports a blank number as REQUIRED", () => {
    expect(issueOf(requiredWhatsappNumberSchema, "")).toBe("REQUIRED");
    expect(issueOf(requiredWhatsappNumberSchema, " - ")).toBe("REQUIRED");
  });

  it("AC-TEAM-005 reports 12345 as INVALID (BR-CLI-002)", () => {
    expect(issueOf(requiredWhatsappNumberSchema, "12345")).toBe("INVALID");
  });
});

describe("team member email", () => {
  it("AC-TEAM-004 lower-cases the email and treats blank as none", () => {
    expect(optionalEmailSchema.parse("Rina@Example.com")).toBe("rina@example.com");
    expect(optionalEmailSchema.parse("  ")).toBeNull();
  });

  it("AC-TEAM-005 reports rina@ as INVALID", () => {
    expect(issueOf(optionalEmailSchema, "rina@")).toBe("INVALID");
  });

  it("AC-TEAM-005 reports an over-long email as TOO_LONG", () => {
    expect(issueOf(optionalEmailSchema, `${"a".repeat(250)}@x.id`)).toBe("TOO_LONG");
  });
});

describe("team member roles", () => {
  it("AC-TEAM-005 requires at least one role", () => {
    const result = roleIdsSchema.safeParse([]);
    expect(result.error?.issues.at(0)?.message).toBe("REQUIRED");
  });

  it("AC-TEAM-004 deduplicates the role IDs and keeps their order", () => {
    expect(roleIdsSchema.parse([ROLE_A, ROLE_B, ROLE_A])).toEqual([ROLE_A, ROLE_B]);
  });

  it("AC-TEAM-005 rejects an id that is not a uuid", () => {
    expect(roleIdsSchema.safeParse(["nope"]).success).toBe(false);
  });
});
