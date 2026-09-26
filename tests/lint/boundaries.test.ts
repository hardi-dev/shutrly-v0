import { describe, expect, it } from "vitest";

import { ruleIds } from "./helpers/lint-source";

describe("architecture boundaries", () => {
  it("AC-FND-009 rejects forbidden feature imports", async () => {
    const ids = await ruleIds("src/features/demo/domain/x.ts", 'import "drizzle-orm";');
    expect(ids).toContain("no-restricted-imports");
  });

  it("AC-FND-009 allows permitted shared imports", async () => {
    const ids = await ruleIds("src/features/demo/domain/x.ts", 'import "zod";');
    expect(ids.filter((id) => id === "boundaries/dependencies")).toEqual([]);
  });
});
