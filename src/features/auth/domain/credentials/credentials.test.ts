import { describe, expect, it } from "vitest";

import {
  checkPassword,
  normaliseEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./credentials";

describe("normaliseEmail", () => {
  it("BR-AUTH-002 trims and lower-cases so one address maps to one identity", () => {
    expect(normaliseEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });
});

describe("checkPassword", () => {
  it("AC-AUTH-002 rejects a password shorter than 8 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toBe("TOO_SHORT");
  });

  it("AC-AUTH-002 accepts exactly 8 and exactly 128 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MIN_LENGTH))).toBe("OK");
    expect(checkPassword("a".repeat(PASSWORD_MAX_LENGTH))).toBe("OK");
  });

  it("AC-AUTH-002 rejects a password longer than 128 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MAX_LENGTH + 1))).toBe("TOO_LONG");
  });

  it("AC-AUTH-002 applies no composition rules (A-1)", () => {
    expect(checkPassword("aaaaaaaa")).toBe("OK");
  });
});
