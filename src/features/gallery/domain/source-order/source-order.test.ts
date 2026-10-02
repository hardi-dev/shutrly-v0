import { describe, expect, it } from "vitest";

import { sortSources } from "./source-order";

describe("sortSources (A-3)", () => {
  it("AC-SRC-003 puts active first, then names case-insensitively", () => {
    const sorted = sortSources([
      { displayName: "Arsip 2024", isActive: false },
      { displayName: "Google Drive Utama", isActive: true },
      { displayName: "google drive arsip", isActive: true },
    ]);
    expect(sorted.map((s) => s.displayName)).toEqual([
      "google drive arsip",
      "Google Drive Utama",
      "Arsip 2024",
    ]);
  });
});
