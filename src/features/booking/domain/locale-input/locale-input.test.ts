import { describe, expect, it } from "vitest";

import { parseIdrAmount } from "../idr-amount/idr-amount";
import { reformatAmountInput, reformatQuantityInput } from "./locale-input";

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

  it("AC-L10N-004 a quantity typed in id is rewritten in en with the same value", () => {
    expect(reformatQuantityInput("1,5", "id-ID", "en-US")).toBe("1.5");
  });

  it("AC-L10N-004 an unparseable quantity is kept as typed", () => {
    expect(reformatQuantityInput("1.5", "id-ID", "en-US")).toBe("1.5");
    expect(reformatQuantityInput("abc", "id-ID", "en-US")).toBe("abc");
  });
});
