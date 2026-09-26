import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { requireOwner, resolveOwnerAccess } from "./owner-access";

function session(status: AccountStatus, emailVerified: boolean) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, status, emailVerified };
  const userId = fake.backend.seedUser(seed);
  return { ...fake, userId, headers: fake.backend.signIn(userId) };
}

describe("owner access policy", () => {
  it("AC-AUTH-007 returns the account for a verified active session", async () => {
    const { deps, userId, headers } = session("ACTIVE", true);
    await expect(requireOwner(deps, headers)).resolves.toMatchObject({ id: userId });
  });

  it("AC-AUTH-014 refuses a request without a session", async () => {
    const { deps } = session("ACTIVE", true);
    await expect(requireOwner(deps, new Headers())).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
    expect((await resolveOwnerAccess(deps, new Headers())).decision).toBe("ANONYMOUS");
  });

  it("AC-AUTH-009 BR-AUTH-003 refuses an unverified session", async () => {
    const { deps, headers } = session("ACTIVE", false);
    await expect(requireOwner(deps, headers)).rejects.toMatchObject({ code: "EMAIL_UNVERIFIED" });
  });

  it("AC-AUTH-014 refuses a surviving session once the status is no longer ACTIVE", async () => {
    const { deps, backend, userId, headers } = session("ACTIVE", true);
    const user = backend.users.get(userId);
    if (!user) throw new Error("expected the seeded user");
    // Changed without revoking, to prove the per-request check (not revocation) blocks access.
    user.status = "SUSPENDED";
    await expect(requireOwner(deps, headers)).rejects.toMatchObject({
      code: "ACCOUNT_UNAVAILABLE",
    });
  });
});
