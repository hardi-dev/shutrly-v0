import { describe, expect, it } from "vitest";

import { accessDecision, asAuthUserId, googleLinkDecision, isAccountStatus } from "./account";

describe("accessDecision", () => {
  it("BR-AUTH-003 is ANONYMOUS without an account", () => {
    expect(accessDecision(null)).toBe("ANONYMOUS");
  });

  it.each(["SUSPENDED", "DISABLED"] as const)(
    "AC-AUTH-013 BR-AUTH-005 blocks a %s account even when verified",
    (status) => {
      expect(accessDecision({ status, emailVerified: true })).toBe("UNAVAILABLE");
    },
  );

  it("BR-AUTH-005 checks status before verification", () => {
    expect(accessDecision({ status: "SUSPENDED", emailVerified: false })).toBe("UNAVAILABLE");
  });

  it("AC-AUTH-009 BR-AUTH-003 restricts an active unverified account", () => {
    expect(accessDecision({ status: "ACTIVE", emailVerified: false })).toBe("RESTRICTED");
  });

  it("AC-AUTH-007 grants owner access to an active verified account", () => {
    expect(accessDecision({ status: "ACTIVE", emailVerified: true })).toBe("OWNER");
  });
});

describe("googleLinkDecision", () => {
  it("AC-AUTH-028 BR-AUTH-006 rejects an unverified Google email", () => {
    expect(googleLinkDecision({ googleEmailVerified: false, existing: null })).toBe("REJECT");
    const existing = { emailVerified: true };
    expect(googleLinkDecision({ googleEmailVerified: false, existing })).toBe("REJECT");
  });

  it("AC-AUTH-024 creates an account when none matches", () => {
    expect(googleLinkDecision({ googleEmailVerified: true, existing: null })).toBe("CREATE");
  });

  it("AC-AUTH-026 links to a verified account", () => {
    const existing = { emailVerified: true };
    expect(googleLinkDecision({ googleEmailVerified: true, existing })).toBe("LINK");
  });

  it("AC-AUTH-027 BR-AUTH-007 guards a link to an unverified account", () => {
    const existing = { emailVerified: false };
    expect(googleLinkDecision({ googleEmailVerified: true, existing })).toBe(
      "LINK_WITH_TAKEOVER_GUARD",
    );
  });
});

describe("account IDs and statuses", () => {
  it("BR-AUTH-005 accepts only the three statuses", () => {
    expect(isAccountStatus("ACTIVE")).toBe(true);
    expect(isAccountStatus("active")).toBe(false);
  });

  it("BR-AUTH-002 brands a non-empty user ID and refuses an empty one", () => {
    expect(asAuthUserId("u_1")).toBe("u_1");
    expect(() => asAuthUserId("")).toThrow();
  });
});
