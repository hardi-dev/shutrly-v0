import { describe, expect, it } from "vitest";

import { pgCode } from "./pg-error";

describe("catalog PostgreSQL error mapping", () => {
  it("reads direct and nested PostgreSQL codes", () => {
    expect(pgCode({ code: "23505" })).toBe("23505");
    expect(pgCode({ cause: { code: "23503" } })).toBe("23503");
    expect(pgCode(new Error("unknown"))).toBeUndefined();
  });
});
