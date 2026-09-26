import { describe, expect, it } from "vitest";

import { openPendingEmail, PENDING_EMAIL_TTL_SECONDS, sealPendingEmail } from "./pending-email";

const secret = "s".repeat(32);
const EMAIL = "owner@example.com";

describe("pending email seal (SPEC GAP-3)", () => {
  it("AC-AUTH-006 round-trips the email within its lifetime", async () => {
    const sealed = await sealPendingEmail(EMAIL, secret, 1_000);
    expect(await openPendingEmail(sealed, secret, 2_000)).toBe(EMAIL);
  });

  it("AC-AUTH-021 does not store the email as plain text", async () => {
    expect(await sealPendingEmail(EMAIL, secret, 1_000)).not.toContain(EMAIL);
  });

  it("AC-AUTH-006 refuses tampering, another secret, garbage and expiry", async () => {
    const sealed = await sealPendingEmail(EMAIL, secret, 1_000);
    const victim = await sealPendingEmail("victim@example.com", secret, 1_000);
    const forged = `${victim.split(".")[0] ?? ""}${sealed.slice(sealed.indexOf("."))}`;
    const expired = 1_000 + PENDING_EMAIL_TTL_SECONDS * 1000 + 1;
    expect(await openPendingEmail(forged, secret, 2_000)).toBeNull();
    expect(await openPendingEmail(sealed, "t".repeat(32), 2_000)).toBeNull();
    expect(await openPendingEmail("nonsense", secret, 2_000)).toBeNull();
    expect(await openPendingEmail(undefined, secret, 2_000)).toBeNull();
    expect(await openPendingEmail(sealed, secret, expired)).toBeNull();
  });
});
