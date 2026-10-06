import { describe, expect, it } from "vitest";

import { lockCheck, selectionCardState } from "./selection-group-status";

describe("lockCheck (BR-SEL-005)", () => {
  it("AC-SEL-011 lets Kunci pilihan lock a submitted group and Tutup pilihan close an open one", () => {
    expect(lockCheck("SUBMITTED", "LOCK")).toBe("OK");
    expect(lockCheck("OPEN", "CLOSE")).toBe("OK");
  });

  it("AC-SEL-011 refuses the wrong action for the status, and any action on a locked group", () => {
    expect(lockCheck("OPEN", "LOCK")).toBe("INVALID_STATE");
    expect(lockCheck("SUBMITTED", "CLOSE")).toBe("INVALID_STATE");
    expect(lockCheck("LOCKED", "LOCK")).toBe("INVALID_STATE");
    expect(lockCheck("LOCKED", "CLOSE")).toBe("INVALID_STATE");
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
