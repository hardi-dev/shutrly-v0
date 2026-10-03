import { describe, expect, it } from "vitest";

import { numberTaken, validationFailure } from "./client-results";

describe("client results", () => {
  it("maps validation issues to dot-separated field paths and safe keys", () => {
    expect(
      validationFailure([
        { code: "custom", path: ["socialLinks", 1, "value"], message: "DUPLICATE" },
        { code: "custom", path: ["name"], message: "Invalid input: expected string" },
      ]),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "socialLinks.1.value": "DUPLICATE", name: "INVALID" },
    });
  });

  it("returns the existing number holder", () => {
    expect(numberTaken({ name: "Budi", isArchived: true })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { whatsappNumber: "TAKEN" },
      numberHolder: { name: "Budi", isArchived: true },
    });
  });
});
