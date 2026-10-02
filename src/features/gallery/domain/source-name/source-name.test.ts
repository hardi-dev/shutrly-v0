import { describe, expect, it } from "vitest";

import { findSourceNameProblem, normaliseSourceName, sourceNameKey } from "./source-name";

describe("source name (BR-SRC-005)", () => {
  it.each([
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    ["a".repeat(61), "TOO_LONG"],
    [`  ${"a".repeat(60)}  `, null],
    ["Google Drive Arsip", null],
  ])("AC-SRC-008 %j → %s", (raw, problem) => {
    expect(findSourceNameProblem(raw)).toBe(problem);
  });

  it("AC-SRC-010 trims and keys names case-insensitively", () => {
    expect(normaliseSourceName("  Google Drive Utama ")).toBe("Google Drive Utama");
    expect(sourceNameKey(" google DRIVE utama")).toBe(sourceNameKey("Google Drive Utama"));
  });
});
