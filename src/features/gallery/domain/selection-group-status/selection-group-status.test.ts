import { describe, expect, it } from "vitest";

import { lockCheck, lockIntentFor, selectionCardState } from "./selection-group-status";

describe("lockCheck (BR-SEL-005)", () => {
  const SENT = new Date("2026-10-07T03:00:00Z");

  it("AC-SEL-011 lets Kunci pilihan lock a submitted group or an open one the client sent, and Tutup pilihan close one never sent", () => {
    expect(lockCheck({ status: "SUBMITTED", submittedAt: SENT }, "LOCK")).toBe("OK");
    expect(lockCheck({ status: "OPEN", submittedAt: SENT }, "LOCK")).toBe("OK");
    expect(lockCheck({ status: "OPEN", submittedAt: null }, "CLOSE")).toBe("OK");
  });

  it("AC-SEL-011 refuses the wrong action for the group, and any action on a locked group", () => {
    expect(lockCheck({ status: "OPEN", submittedAt: null }, "LOCK")).toBe("INVALID_STATE");
    expect(lockCheck({ status: "OPEN", submittedAt: SENT }, "CLOSE")).toBe("INVALID_STATE");
    expect(lockCheck({ status: "SUBMITTED", submittedAt: SENT }, "CLOSE")).toBe("INVALID_STATE");
    expect(lockCheck({ status: "LOCKED", submittedAt: SENT }, "LOCK")).toBe("INVALID_STATE");
    expect(lockCheck({ status: "LOCKED", submittedAt: null }, "CLOSE")).toBe("INVALID_STATE");
  });

  it("lockIntentFor offers the one action the Owner has for the group", () => {
    expect(lockIntentFor({ status: "SUBMITTED", submittedAt: SENT })).toBe("LOCK");
    expect(lockIntentFor({ status: "OPEN", submittedAt: SENT })).toBe("LOCK");
    expect(lockIntentFor({ status: "OPEN", submittedAt: null })).toBe("CLOSE");
    expect(lockIntentFor({ status: "LOCKED", submittedAt: SENT })).toBeNull();
  });
});

describe("selectionCardState (card export states A–E)", () => {
  it("E: a package without selection items", () => {
    expect(selectionCardState({ itemCount: 0, statuses: [] })).toBe("NO_ITEMS");
  });

  it("A: items but no groups yet, because the gallery isn't published", () => {
    expect(selectionCardState({ itemCount: 2, statuses: [] })).toBe("NOT_PUBLISHED");
  });

  it("B: groups open, or some locked without anything to review", () => {
    expect(selectionCardState({ itemCount: 2, statuses: ["OPEN", "OPEN"] })).toBe("OPEN");
    expect(selectionCardState({ itemCount: 2, statuses: ["LOCKED", "OPEN"] })).toBe("OPEN");
  });

  it("C: any submitted group needs review", () => {
    expect(selectionCardState({ itemCount: 2, statuses: ["SUBMITTED", "OPEN"] })).toBe("REVIEW");
  });

  it("D: every group locked", () => {
    expect(selectionCardState({ itemCount: 2, statuses: ["LOCKED", "LOCKED"] })).toBe("FINAL");
  });
});
