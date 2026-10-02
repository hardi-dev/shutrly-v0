import { describe, expect, it } from "vitest";

import { clientInputSchema } from "./client-input/client-input.schema";
import { clientListQuerySchema } from "./client-list-query/client-list-query.schema";

describe("client schemas", () => {
  it("AC-CLI-008 AC-CLI-009 AC-CLI-011 reports all client-input issues", () => {
    const result = clientInputSchema.safeParse({
      name: " ",
      whatsappNumber: "0812",
      socialLinks: [{ platform: "MYSPACE", value: "rina" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      ).toEqual([
        { path: ["name"], message: "EMPTY" },
        { path: ["whatsappNumber"], message: "INVALID" },
        { path: ["socialLinks", 0, "platform"], message: "UNKNOWN_PLATFORM" },
      ]);
    }
  });

  it("AC-CLI-006 returns normalised client fields and accepts a blank number", () => {
    expect(
      clientInputSchema.parse({
        name: "  Rina Wedding ",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [
          { platform: "INSTAGRAM", value: "@rina.wed" },
          { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
        ],
      }),
    ).toEqual({
      name: "Rina Wedding",
      whatsappNumber: "6281234567890",
      socialLinks: [
        { platform: "INSTAGRAM", value: "rina.wed" },
        { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
      ],
    });
    expect(
      clientInputSchema.parse({ name: "ade", whatsappNumber: " ", socialLinks: [] }).whatsappNumber,
    ).toBeNull();
  });

  it("keeps over-long q but rejects invalid statuses and cursors", () => {
    expect(clientListQuerySchema.safeParse({ status: "DELETED" }).success).toBe(false);
    expect(
      clientListQuerySchema.safeParse({ status: "ACTIVE", afterId: "not-a-uuid" }).success,
    ).toBe(false);
    expect(clientListQuerySchema.parse({ status: "ACTIVE", q: "a".repeat(101) }).q).toHaveLength(
      101,
    );
  });
});
