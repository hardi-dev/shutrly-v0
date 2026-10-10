import { describe, expect, it } from "vitest";

import { normalizeWaitlistEmail, WAITLIST_EMAIL_MAX_LENGTH } from "./waitlist-email";

describe("waitlist email", () => {
  it("allows at most 254 characters, the longest valid address", () => {
    expect(WAITLIST_EMAIL_MAX_LENGTH).toBe(254);
  });

  it("AC-LND-007 trims and lowercases so the same person matches one contact", () => {
    expect(normalizeWaitlistEmail("  RINA@Example.com ")).toBe("rina@example.com");
  });
});
