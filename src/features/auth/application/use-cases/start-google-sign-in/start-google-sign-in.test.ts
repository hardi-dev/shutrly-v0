import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { describe, expect, it } from "vitest";

import { startGoogleSignIn } from "./start-google-sign-in";

describe("startGoogleSignIn", () => {
  it("AC-AUTH-024 AC-AUTH-029 returns to /auth/continue, or to /login on failure", async () => {
    const { deps } = fakeAuthDeps();
    const spy = deps.identity.googleSignInUrl;
    const calls: unknown[] = [];
    deps.identity.googleSignInUrl = (redirects) => {
      calls.push(redirects);
      return spy(redirects);
    };
    const start = await startGoogleSignIn(deps);
    expect(calls).toEqual([{ callbackURL: "/auth/continue", errorCallbackURL: "/login" }]);
    expect(start.setCookies).not.toHaveLength(0);
  });
});
