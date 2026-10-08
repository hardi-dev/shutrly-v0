import { describe, expect, it } from "vitest";

import { isWellFormedToken } from "./client-token";

describe("client token format (D-4)", () => {
  it("accepts 43 base64url characters", () => {
    expect(isWellFormedToken("A".repeat(42) + "_")).toBe(true);
  });

  it.each(["", "short", "A".repeat(44), "A".repeat(42) + "/"])("AC-ACC-004 refuses %j", (value) => {
    expect(isWellFormedToken(value)).toBe(false);
  });
});
