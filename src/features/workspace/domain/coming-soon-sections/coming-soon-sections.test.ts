import { describe, expect, it } from "vitest";

import { isComingSoonSection } from "./coming-soon-sections";

describe("coming soon sections", () => {
  it("AC-SRC-004 no longer treats client-sources as coming soon", () => {
    expect(isComingSoonSection("client-sources")).toBe(false);
  });

  it("AC-CAT-003 no longer treats services as coming soon", () => {
    expect(isComingSoonSection("services")).toBe(false);
  });
});
