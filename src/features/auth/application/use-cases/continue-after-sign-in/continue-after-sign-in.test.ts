import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { continueAfterSignIn } from "./continue-after-sign-in";

function owner(status: AccountStatus, emailVerified: boolean, destination?: "WORKSPACE") {
  const fake = fakeAuthDeps(destination);
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, status, emailVerified };
  const userId = fake.backend.seedUser(seed);
  fake.backend.signIn(userId);
  return { ...fake, userId };
}

describe("continueAfterSignIn", () => {
  it("AC-AUTH-004 BR-AUTH-004 sends a verified owner without a workspace to onboarding", async () => {
    const { deps, userId } = owner("ACTIVE", true);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "OWNER",
      path: "/onboarding/workspace",
    });
  });

  it("AC-AUTH-007 sends an owner with a workspace to it", async () => {
    const { deps, userId } = owner("ACTIVE", true, "WORKSPACE");
    expect(await continueAfterSignIn(deps, userId)).toEqual({ kind: "OWNER", path: "/workspace" });
  });

  it("AC-AUTH-009 confines an unverified owner to /verify", async () => {
    const { deps, userId } = owner("ACTIVE", false);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "RESTRICTED",
      path: "/verify",
    });
  });

  it("AC-AUTH-013 revokes every session of a non-active owner", async () => {
    const { deps, backend, userId } = owner("SUSPENDED", true);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "UNAVAILABLE",
      path: "/account-unavailable",
    });
    expect(backend.sessions.size).toBe(0);
  });
});
