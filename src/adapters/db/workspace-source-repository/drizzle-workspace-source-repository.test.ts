import { describe, expect, it } from "vitest";

import { pgCode } from "./drizzle-workspace-source-repository";

describe("workspace source repository database errors", () => {
  it("AC-SRC-013 reads a wrapped foreign-key violation", () => {
    expect(pgCode({ cause: { code: "23503" } })).toBe("23503");
  });

  it("reads a direct Postgres error code", () => {
    expect(pgCode({ code: "23505" })).toBe("23505");
  });
});
