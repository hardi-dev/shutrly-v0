import { describe, expect, it } from "vitest";

import { CLIENT_SEARCH_MAX_LENGTH } from "./client-search";
import { clientSearchSchema } from "./client-search.schema";

describe("client search (A-4)", () => {
  it("AC-CLI-004 searches names by text", () => {
    expect(clientSearchSchema.parse(" RIN ")).toEqual({ text: "RIN", digits: null });
  });

  it.each([
    ["0812 3456", "628123456"],
    ["+62812", "62812"],
    ["812", "812"],
  ])("AC-CLI-004 normalizes the digits in %s", (raw, digits) => {
    expect(clientSearchSchema.parse(raw).digits).toBe(digits);
  });

  it("fails on blank and over-long queries, which the use case lists unfiltered (TD-A-1)", () => {
    expect(clientSearchSchema.safeParse("  ").success).toBe(false);
    expect(clientSearchSchema.safeParse("a".repeat(CLIENT_SEARCH_MAX_LENGTH + 1)).success).toBe(
      false,
    );
  });
});
