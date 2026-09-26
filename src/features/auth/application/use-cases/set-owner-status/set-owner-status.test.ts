import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { setOwnerStatus } from "./set-owner-status";

function seeded() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const userId = fake.backend.seedUser({
    name: "Alya",
    email,
    password: PASSWORD,
    status: "ACTIVE",
    emailVerified: true,
  });
  return { fake, email, userId };
}

describe("setOwnerStatus", () => {
  it("AC-AUTH-015 changes the status and revokes every session", async () => {
    const { fake, email, userId } = seeded();
    fake.backend.signIn(userId);
    fake.backend.signIn(userId);
    const result = await setOwnerStatus(fake.deps, { email, status: "SUSPENDED" });
    expect(result).toEqual({ ok: true, userId });
    expect(fake.backend.sessions.size).toBe(0);
    expect((await fake.deps.accounts.getById(userId))?.status).toBe("SUSPENDED");
  });

  it("AC-AUTH-015 setting ACTIVE again restores access", async () => {
    const { fake, email, userId } = seeded();
    await setOwnerStatus(fake.deps, { email, status: "DISABLED" });
    await setOwnerStatus(fake.deps, { email, status: "ACTIVE" });
    expect((await fake.deps.accounts.getById(userId))?.status).toBe("ACTIVE");
  });

  it("AC-AUTH-015 refuses an unknown status and an unknown email", async () => {
    const { fake } = seeded();
    expect(await setOwnerStatus(fake.deps, { email: uniqueEmail(), status: "ACTIVE" })).toEqual({
      ok: false,
      reason: "NOT_FOUND",
    });
    expect(await setOwnerStatus(fake.deps, { email: uniqueEmail(), status: "BANNED" })).toEqual({
      ok: false,
      reason: "UNKNOWN_STATUS",
    });
  });
});
