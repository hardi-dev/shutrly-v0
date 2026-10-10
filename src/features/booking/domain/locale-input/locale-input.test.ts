import { describe, expect, it } from "vitest";

import { parseIdrAmount } from "../idr-amount/idr-amount";
import { reformatAmountInput } from "./locale-input";

describe("reformatAmountInput", () => {
  it("AC-L10N-004 an amount typed in id is rewritten in en with the same value", () => {
    expect(reformatAmountInput("750.000", "id-ID", "en-US")).toBe("750,000");
  });

  it("AC-L10N-004 unparseable text is kept as typed", () => {
    expect(reformatAmountInput("7,5", "id-ID", "en-US")).toBe("7,5");
    expect(reformatAmountInput("abc", "id-ID", "en-US")).toBe("abc");
  });

  it("C-105 the rewritten value parses back to the same digits", () => {
    const rewritten = reformatAmountInput("1.500.000", "id-ID", "en-US");
    expect(parseIdrAmount(rewritten, "en-US")).toEqual({ ok: true, amount: "1500000" });
  });
});
