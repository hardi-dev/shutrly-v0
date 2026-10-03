import { describe, expect, it } from "vitest";

import { isReferencedRowError, pgCode } from "./pg-error";

describe("catalog PostgreSQL error mapping", () => {
  it("reads direct and nested PostgreSQL codes", () => {
    expect(pgCode({ code: "23505" })).toBe("23505");
    expect(pgCode({ cause: { code: "23503" } })).toBe("23503");
    expect(pgCode(new Error("unknown"))).toBeUndefined();
  });

  it("AC-PRJ-024 treats a foreign-key and a restrict violation as a referenced row", () => {
    expect(isReferencedRowError({ code: "23503" })).toBe(true);
    expect(isReferencedRowError({ cause: { code: "23001" } })).toBe(true);
    expect(isReferencedRowError({ code: "23505" })).toBe(false);
  });
});
