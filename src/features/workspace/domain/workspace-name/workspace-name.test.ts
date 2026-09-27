import { describe, expect, it } from "vitest";

import { normaliseWorkspaceName, workspaceNameKey } from "./workspace-name";

describe("normaliseWorkspaceName", () => {
  it("AC-WS-003 trims a valid workspace name", () => {
    expect(normaliseWorkspaceName("  Aster Wedding  ")).toBe("Aster Wedding");
  });

  it("AC-WS-003 rejects an empty or overlong name", () => {
    expect(() => normaliseWorkspaceName("   ")).toThrow();
    expect(() => normaliseWorkspaceName("a".repeat(61))).toThrow();
  });
});

describe("workspaceNameKey", () => {
  it("A-2 compares trimmed names case-insensitively", () => {
    expect(workspaceNameKey("  Aster Wedding ")).toBe("aster wedding");
  });
});
