import { describe, expect, it } from "vitest";

import { AUTH_TTL, isSocialCallback } from "./create-auth";

describe("createAuth options", () => {
  it("AC-AUTH-028 recognises Better Auth's social callback endpoints", () => {
    expect(isSocialCallback({ path: "/callback/google" })).toBe(true);
    expect(isSocialCallback({ path: "/sign-up/email" })).toBe(false);
    expect(isSocialCallback(null)).toBe(false);
  });

  it("AC-AUTH-005 AC-AUTH-018 uses the A-2 and A-3 lifetimes", () => {
    expect(AUTH_TTL).toEqual({
      sessionSeconds: 604_800,
      sessionUpdateAgeSeconds: 86_400,
      verifySeconds: 86_400,
      resetSeconds: 3_600,
    });
  });
});
