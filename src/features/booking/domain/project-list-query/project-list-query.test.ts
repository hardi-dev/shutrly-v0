import { describe, expect, it } from "vitest";

import { PROJECT_PAGE_SIZE } from "./project-list-query";
import { projectSearchSchema } from "./project-list-query.schema";

describe("project list query", () => {
  it("AC-PRJ-005 pages by 30", () => {
    expect(PROJECT_PAGE_SIZE).toBe(30);
  });

  it("AC-PRJ-004 trims the search and rejects blank or over-long text", () => {
    expect(projectSearchSchema.safeParse("  rina ").data).toBe("rina");
    expect(projectSearchSchema.safeParse("   ").success).toBe(false);
    expect(projectSearchSchema.safeParse("a".repeat(101)).success).toBe(false);
    expect(projectSearchSchema.safeParse("a".repeat(100)).success).toBe(true);
  });
});
