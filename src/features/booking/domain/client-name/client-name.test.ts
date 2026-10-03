import { describe, expect, it } from "vitest";

import { CLIENT_NAME_MAX_LENGTH } from "./client-name";
import { clientNameSchema } from "./client-name.schema";

const issue = (raw: string) => clientNameSchema.safeParse(raw).error?.issues[0]?.message;

describe("client name (BR-CLI-001)", () => {
  it("AC-CLI-008 rejects empty and over-long names after trimming, counting code points", () => {
    expect(issue("   ")).toBe("EMPTY");
    expect(issue("a".repeat(CLIENT_NAME_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(issue(` ${"a".repeat(CLIENT_NAME_MAX_LENGTH)} `)).toBeUndefined();
    expect(issue("😀".repeat(CLIENT_NAME_MAX_LENGTH))).toBeUndefined();
  });

  it("AC-CLI-006 trims the stored name", () => {
    expect(clientNameSchema.parse("  Rina Wedding ")).toBe("Rina Wedding");
  });
});
