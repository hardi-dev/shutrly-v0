import { describe, expect, it } from "vitest";

import { SOCIAL_LINK_MAX_COUNT, SOCIAL_VALUE_MAX_LENGTH, socialLinkLabel } from "./social-link";
import { socialLinkRowsSchema, socialValueSchema } from "./social-link.schema";

const valueIssue = (raw: string) => socialValueSchema.safeParse(raw).error?.issues[0]?.message;
const rowIssues = (rows: readonly { platform: string; value: string }[]) =>
  socialLinkRowsSchema
    .safeParse(rows)
    .error?.issues.map((i) => ({ path: i.path, message: i.message }));

describe("social links (BR-CLI-001, A-2)", () => {
  it("AC-CLI-006 drops a leading @ from handles and keeps URLs", () => {
    expect(socialValueSchema.parse("  @rina.wed ")).toBe("rina.wed");
    expect(socialValueSchema.parse("https://www.tiktok.com/@rina")).toBe(
      "https://www.tiktok.com/@rina",
    );
  });

  it("AC-CLI-011 rejects a bare @, non-https URLs and over-long values", () => {
    expect(valueIssue("@")).toBe("EMPTY");
    expect(valueIssue("http:" + "//instagram.com/rina")).toBe("INVALID_URL");
    expect(valueIssue("a".repeat(SOCIAL_VALUE_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(valueIssue("rina.wed")).toBeUndefined();
  });

  it("AC-CLI-006 AC-CLI-007 drops blank rows and keeps the Owner's order", () => {
    expect(
      socialLinkRowsSchema.parse([
        { platform: "INSTAGRAM", value: "@rina.wed" },
        { platform: "FACEBOOK", value: "  " },
        { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
      ]),
    ).toEqual([
      { platform: "INSTAGRAM", value: "rina.wed" },
      { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
    ]);
  });

  it("AC-CLI-011 flags later rows with the same platform and value, ignoring case and @", () => {
    expect(
      rowIssues([
        { platform: "INSTAGRAM", value: "@rina.wed" },
        { platform: "TIKTOK", value: "rina.wed" },
        { platform: "INSTAGRAM", value: "RINA.WED" },
        { platform: "INSTAGRAM", value: "" },
        { platform: "INSTAGRAM", value: "" },
      ]),
    ).toEqual([{ path: [2, "value"], message: "DUPLICATE" }]);
  });

  it("AC-CLI-011 rejects an unknown platform and more than ten rows", () => {
    expect(rowIssues([{ platform: "MYSPACE", value: "rina" }])).toEqual([
      { path: [0, "platform"], message: "UNKNOWN_PLATFORM" },
    ]);
    const rows = Array.from({ length: SOCIAL_LINK_MAX_COUNT + 1 }, (_, i) => ({
      platform: "OTHER",
      value: `akun${String(i)}`,
    }));
    expect(rowIssues(rows)).toEqual([{ path: [], message: "TOO_MANY" }]);
  });

  it("AC-CLI-001 labels handles with @ and URLs without the scheme", () => {
    expect(socialLinkLabel({ platform: "INSTAGRAM", value: "anisaputri" })).toBe("@anisaputri");
    expect(
      socialLinkLabel({ platform: "TIKTOK", value: "https://www.tiktok.com/@bayularas" }),
    ).toBe("tiktok.com/@bayularas");
  });
});
