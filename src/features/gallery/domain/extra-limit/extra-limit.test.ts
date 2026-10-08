import { describe, expect, it } from "vitest";

import { addOnTargetCheck, extraLimitChange } from "./extra-limit";
import type { ExtraLimitFacts } from "./extra-limit.types";

const EDIT: ExtraLimitFacts = { status: "OPEN", baseLimit: 3, extraLimit: 0, usage: 3 };

describe("add-on target (BR-ADD-002, A-10)", () => {
  it("AC-ADD-002 an open or submitted group can be targeted, a locked one can't", () => {
    expect(addOnTargetCheck("OPEN")).toBe("OK");
    expect(addOnTargetCheck("SUBMITTED")).toBe("OK");
    expect(addOnTargetCheck("LOCKED")).toBe("TARGET_LOCKED");
  });
});

describe("extraLimitChange (BR-SEL-002, BR-ADD-004, BR-ADD-005)", () => {
  it("AC-ADD-001 approving 5 on an open group raises extra to 5, no reopen", () => {
    expect(extraLimitChange(EDIT, 5)).toEqual({ ok: true, extraLimit: 5, reopen: false });
  });

  it("AC-ADD-007 approving on a submitted group reopens it", () => {
    expect(extraLimitChange({ ...EDIT, status: "SUBMITTED" }, 5)).toEqual({
      ok: true,
      extraLimit: 5,
      reopen: true,
    });
  });

  it("AC-ADD-007 a locked group is never reopened by an add-on", () => {
    expect(extraLimitChange({ ...EDIT, status: "LOCKED" }, 5)).toEqual({
      ok: false,
      code: "TARGET_LOCKED",
    });
  });

  it("AC-ADD-005 a cancel that would leave the limit below usage is refused with both", () => {
    const facts = { ...EDIT, extraLimit: 5, usage: 7 };
    expect(extraLimitChange(facts, -5)).toEqual({
      ok: false,
      code: "CANCEL_BELOW_USAGE",
      usage: 7,
      limit: 3,
    });
  });

  it("AC-ADD-005 a cancel down to exactly the usage is allowed", () => {
    expect(extraLimitChange({ ...EDIT, extraLimit: 5 }, -5)).toEqual({
      ok: true,
      extraLimit: 0,
      reopen: false,
    });
  });

  it("A-22 cancelling never changes the status, even of a submitted or locked group", () => {
    for (const status of ["SUBMITTED", "LOCKED"] as const) {
      const result = extraLimitChange({ ...EDIT, status, extraLimit: 5, usage: 2 }, -5);
      expect(result).toEqual({ ok: true, extraLimit: 0, reopen: false });
    }
  });

  it("BR-SEL-002 refuses to drive extra_limit below zero (a broken sum is a bug)", () => {
    expect(() => extraLimitChange({ ...EDIT, extraLimit: 2 }, -5)).toThrow();
  });
});
