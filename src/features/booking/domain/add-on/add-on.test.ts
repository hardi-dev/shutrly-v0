import { describe, expect, it } from "vitest";

import {
  addOnTotal,
  addOnTransition,
  canCreateAddOn,
  isAddOnEditable,
  isAddOnTotalInRange,
  limitDelta,
} from "./add-on";

describe("add-on amounts (BR-ADD-006, BR-CUR-003, A-10)", () => {
  it("AC-ADD-001 total is quantity × unit price, exact", () => {
    expect(addOnTotal(5, "20000")).toBe("100000");
  });

  it("AC-ADD-003 multiplies large amounts without floating point", () => {
    expect(addOnTotal(3, "333333333333")).toBe("999999999999");
    expect(addOnTotal(1, "750000")).toBe("750000");
  });

  it("a total above the largest stored amount is out of range", () => {
    expect(isAddOnTotalInRange("999999999999")).toBe(true);
    expect(isAddOnTotalInRange(addOnTotal(2, "999999999999"))).toBe(false);
  });

  it("BR-ADD-006 a free add-on totals zero", () => {
    expect(addOnTotal(4, "0")).toBe("0");
  });
});

describe("add-on lifecycle (BR-ADD-003, A-35)", () => {
  it.each([
    ["DRAFT", "APPROVE", { kind: "MOVE", to: "APPROVED" }],
    ["DRAFT", "CANCEL", { kind: "MOVE", to: "CANCELLED" }],
    ["DRAFT", "DELETE", { kind: "DELETE" }],
    ["APPROVED", "CANCEL", { kind: "MOVE", to: "CANCELLED" }],
    ["APPROVED", "APPROVE", { kind: "SAME" }],
    ["CANCELLED", "CANCEL", { kind: "SAME" }],
    ["APPROVED", "DELETE", { kind: "REFUSED" }],
    ["CANCELLED", "APPROVE", { kind: "REFUSED" }],
    ["CANCELLED", "DELETE", { kind: "REFUSED" }],
  ] as const)("%s + %s", (status, action, expected) => {
    expect(addOnTransition(status, action)).toEqual(expected);
  });

  it("AC-ADD-004 only a draft may be edited; approved and cancelled add-ons never", () => {
    expect(isAddOnEditable("DRAFT")).toBe(true);
    expect(isAddOnEditable("APPROVED")).toBe(false);
    expect(isAddOnEditable("CANCELLED")).toBe(false);
  });
});

describe("add-on effect on the group limit (BR-SEL-002, BR-ADD-004, BR-ADD-005)", () => {
  it("AC-ADD-001 approving raises the limit by the quantity", () => {
    expect(limitDelta("DRAFT", "APPROVED", 5)).toBe(5);
  });

  it("AC-ADD-005 cancelling an approved add-on lowers it by the quantity", () => {
    expect(limitDelta("APPROVED", "CANCELLED", 5)).toBe(-5);
  });

  it("cancelling a draft changes nothing", () => {
    expect(limitDelta("DRAFT", "CANCELLED", 5)).toBe(0);
  });
});

describe("projects that take add-ons (A-11)", () => {
  it.each(["BOOKED", "SHOOTING", "POST_PROCESSING", "DELIVERED"] as const)("%s allows", (s) => {
    expect(canCreateAddOn(s)).toBe(true);
  });

  it.each(["DRAFT", "COMPLETED", "CANCELLED"] as const)("%s refuses", (s) => {
    expect(canCreateAddOn(s)).toBe(false);
  });
});
