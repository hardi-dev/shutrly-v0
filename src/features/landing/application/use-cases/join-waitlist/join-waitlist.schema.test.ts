import { describe, expect, it } from "vitest";

import { WAITLIST_EMAIL_MAX_LENGTH } from "@/features/landing/domain/waitlist-email/waitlist-email";

import { joinWaitlistSchema } from "./join-waitlist.schema";

function firstIssue(email: string): string | undefined {
  const result = joinWaitlistSchema.safeParse({ email, website: "" });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("joinWaitlistSchema", () => {
  it("AC-LND-005 accepts a valid email and trims it", () => {
    const result = joinWaitlistSchema.safeParse({ email: " Rina@Example.com ", website: "" });
    expect(result.success && result.data.email).toBe("Rina@Example.com");
  });

  it("AC-LND-006 rejects an empty email as required", () => {
    expect(firstIssue("   ")).toBe("email.required");
  });

  it("AC-LND-006 rejects an incomplete address as invalid", () => {
    expect(firstIssue("rina@")).toBe("email.invalid");
  });

  it("AC-LND-006 rejects an address longer than 254 characters as too long", () => {
    const local = "a".repeat(WAITLIST_EMAIL_MAX_LENGTH);
    expect(firstIssue(`${local}@example.com`)).toBe("email.tooLong");
  });

  it("AC-LND-009 lets a filled bot field through so the use case can drop it silently", () => {
    const result = joinWaitlistSchema.safeParse({ email: "rina@example.com", website: "spam" });
    expect(result.success).toBe(true);
  });
});
