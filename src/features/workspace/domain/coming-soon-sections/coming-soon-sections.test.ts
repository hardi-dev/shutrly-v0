import { describe, expect, it } from "vitest";

import { isComingSoonSection } from "./coming-soon-sections";

describe("coming soon sections", () => {
  it("AC-SRC-004 no longer treats client-sources as coming soon", () => {
    expect(isComingSoonSection("client-sources")).toBe(false);
  });

  it("AC-CAT-003 no longer treats services as coming soon", () => {
    expect(isComingSoonSection("services")).toBe(false);
  });

  it("AC-CLI-001 no longer treats clients as coming soon", () => {
    expect(isComingSoonSection("clients")).toBe(false);
  });

  it("AC-PRJ-001 no longer treats projects as coming soon", () => {
    expect(isComingSoonSection("projects")).toBe(false);
  });

  it("AC-PRJ-007 no longer treats new-project as coming soon", () => {
    expect(isComingSoonSection("new-project")).toBe(false);
  });

  it("AC-TEAM-001 no longer treats team as coming soon (D-17)", () => {
    expect(isComingSoonSection("team")).toBe(false);
  });
});
