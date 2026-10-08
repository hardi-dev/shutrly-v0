import { describe, expect, it } from "vitest";

import {
  canSubmit,
  checkPickChange,
  effectiveLimit,
  remainingPlaces,
  usageOf,
} from "./selection-usage";
import type { PickChange } from "./selection-usage.types";

const count = (usage: number, current: number, next: number, limit = 3): PickChange => ({
  mode: "COUNT",
  limit,
  usage,
  currentQuantity: current,
  nextQuantity: next,
});
const quantity = (usage: number, current: number, next: number, limit = 2): PickChange => ({
  mode: "QUANTITY",
  limit,
  usage,
  currentQuantity: current,
  nextQuantity: next,
});

describe("selection usage (BR-SEL-002, BR-SEL-003, A-8, A-9)", () => {
  it("AC-SEL-002 counts one place per picked photo up to the limit", () => {
    expect(checkPickChange(count(2, 0, 1))).toBe("OK");
    expect(checkPickChange(count(3, 0, 1))).toBe("LIMIT_REACHED");
    expect(checkPickChange(count(3, 1, 0))).toBe("OK");
  });

  it("AC-SEL-003 sums quantities and refuses one past the limit", () => {
    expect(checkPickChange(quantity(1, 1, 2))).toBe("OK");
    expect(checkPickChange(quantity(2, 0, 1))).toBe("LIMIT_REACHED");
    expect(checkPickChange(quantity(2, 2, 3))).toBe("LIMIT_REACHED");
  });

  it("A-8 always allows lowering or removing, even above the limit", () => {
    expect(checkPickChange(quantity(5, 3, 2))).toBe("OK");
    expect(checkPickChange(count(4, 1, 0))).toBe("OK");
  });

  it.each([count(0, 0, 2), quantity(0, 0, -1), quantity(0, 0, 1.5)])(
    "refuses an invalid quantity %j",
    (change) => {
      expect(checkPickChange(change)).toBe("INVALID_QUANTITY");
    },
  );

  it("AC-SEL-016 A-21 a zero limit offers no place", () => {
    expect(checkPickChange(count(0, 0, 1, 0))).toBe("LIMIT_REACHED");
    expect(remainingPlaces(0, 0)).toBe(0);
  });

  it("BR-SEL-002 adds approved add-ons to the base limit and never goes negative", () => {
    expect(effectiveLimit(3, 2)).toBe(5);
    expect(remainingPlaces(3, 5)).toBe(0);
    expect(usageOf("COUNT", [1, 1, 1])).toBe(3);
    expect(usageOf("QUANTITY", [2, 1])).toBe(3);
  });
});

describe("canSubmit (BR-SEL-005, A-5)", () => {
  it("AC-SEL-008 lets an OPEN group with a pick be submitted, below its limit or not", () => {
    expect(canSubmit({ status: "OPEN", pickCount: 2 })).toBe("OK");
  });

  it("AC-SEL-009 refuses a group with no picks", () => {
    expect(canSubmit({ status: "OPEN", pickCount: 0 })).toBe("NO_PICKS");
  });

  it("BR-SEL-005 refuses a group that is already submitted or locked", () => {
    expect(canSubmit({ status: "SUBMITTED", pickCount: 2 })).toBe("NOT_OPEN");
    expect(canSubmit({ status: "LOCKED", pickCount: 2 })).toBe("NOT_OPEN");
  });
});
