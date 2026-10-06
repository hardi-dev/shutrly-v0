import { describe, expect, it } from "vitest";

import { normalisePickNote } from "./pick-note";

describe("pick note (BR-SEL-004, A-32)", () => {
  it("AC-SEL-021 keeps a trimmed note", () => {
    expect(normalisePickNote("  hapus jerawat, cerahkan sedikit ")).toEqual({
      ok: true,
      note: "hapus jerawat, cerahkan sedikit",
    });
  });

  it("AC-SEL-021 clears the note when it is empty", () => {
    expect(normalisePickNote("   ")).toEqual({ ok: true, note: null });
  });

  it("AC-SEL-021 accepts 500 characters and refuses 501", () => {
    expect(normalisePickNote("a".repeat(500)).ok).toBe(true);
    expect(normalisePickNote("a".repeat(501))).toEqual({ ok: false, code: "TOO_LONG" });
  });
});
