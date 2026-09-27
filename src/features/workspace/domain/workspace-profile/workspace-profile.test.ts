import { describe, expect, it } from "vitest";

import { clientBrandName, normaliseWorkspaceProfile } from "./workspace-profile";

describe("workspace profile", () => {
  it("AC-WS-017 trims fields and turns empty optional values into null", () => {
    expect(
      normaliseWorkspaceProfile({
        name: " Aster Wedding ",
        brandName: " ",
        contactEmail: " owner@example.com ",
        phone: " 0812345678 ",
        address: " ",
      }),
    ).toEqual({
      name: "Aster Wedding",
      brandName: null,
      contactEmail: "owner@example.com",
      phone: "0812345678",
      address: null,
    });
  });

  it("AC-WS-017 rejects invalid branding fields", () => {
    expect(() => normaliseWorkspaceProfile({ name: "A", contactEmail: "bad" })).toThrow();
    expect(() => normaliseWorkspaceProfile({ name: "A", phone: "abc" })).toThrow();
    expect(() => normaliseWorkspaceProfile({ name: "A", address: "x".repeat(301) })).toThrow();
  });

  it("AC-WS-018 falls back to the workspace name", () => {
    const profile = normaliseWorkspaceProfile({ name: "Aster Wedding", brandName: "" });
    expect(clientBrandName(profile)).toBe("Aster Wedding");
  });
});
