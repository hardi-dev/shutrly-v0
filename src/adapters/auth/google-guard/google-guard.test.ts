import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { createGoogleClaimsGuard } from "./google-guard";

function owner(emailVerified: boolean) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  fake.backend.signIn(userId);
  return { ...fake, email, userId, guard: createGoogleClaimsGuard(fake.backend.accounts) };
}

describe("Google claims guard", () => {
  it("AC-AUTH-027 BR-AUTH-007 secures an unverified account before Google links it", async () => {
    const { deps, backend, email, userId, guard } = owner(false);
    await guard({ email: email.toUpperCase(), email_verified: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    expect(backend.sessions.size).toBe(0);
  });

  it("AC-AUTH-026 leaves a verified account and its password alone", async () => {
    const { deps, backend, email, userId, guard } = owner(true);
    await guard({ email, email_verified: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({ hasPassword: true });
    expect(backend.sessions.size).toBe(1);
  });

  it("AC-AUTH-028 does nothing for an unverified Google email", async () => {
    const { deps, email, userId, guard } = owner(false);
    await guard({ email, email_verified: false });
    expect(await deps.accounts.getById(userId)).toMatchObject({
      emailVerified: false,
      hasPassword: true,
    });
  });
});
