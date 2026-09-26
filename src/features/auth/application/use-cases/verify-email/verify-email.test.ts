import { PASSWORD } from "@tests/support/auth/credentials";
import { FakeAuthBackend } from "@tests/support/auth/fake-auth-backend";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "../register-owner/register-owner";
import { verifyEmail } from "./verify-email";

async function pendingLink() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(fake.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await fake.settle();
  return { ...fake, email, token: tokenFrom(fake.sender.lastUrl(email, "VERIFY_EMAIL")) };
}

describe("verifyEmail", () => {
  it("AC-AUTH-004 verifies, signs in and hands off to first-workspace creation", async () => {
    const { deps, email, token } = await pendingLink();
    const result = await verifyEmail(deps, token);
    if (!result.ok) throw new Error("expected success");
    expect(result.outcome).toEqual({ kind: "OWNER", path: "/onboarding/workspace" });
    expect((await deps.accounts.findByEmail(email))?.emailVerified).toBe(true);
    const headers = FakeAuthBackend.headersFrom(result);
    expect(await deps.identity.getSessionUserId(headers)).not.toBeNull();
  });

  it("AC-AUTH-005 refuses a superseded, tampered or empty link without verifying", async () => {
    const { deps, settle, email, token } = await pendingLink();
    await deps.identity.sendVerificationLink(email);
    await settle();
    const invalid = { ok: false, code: "INVALID_LINK" };
    expect(await verifyEmail(deps, token)).toEqual(invalid);
    expect(await verifyEmail(deps, `${token}x`)).toEqual(invalid);
    expect(await verifyEmail(deps, "")).toEqual(invalid);
    expect((await deps.accounts.findByEmail(email))?.emailVerified).toBe(false);
  });

  it("AC-AUTH-005 a link works only once", async () => {
    const { deps, token } = await pendingLink();
    expect((await verifyEmail(deps, token)).ok).toBe(true);
    expect(await verifyEmail(deps, token)).toEqual({ ok: false, code: "INVALID_LINK" });
  });

  it("AC-AUTH-013 a suspended owner who verifies gets no session", async () => {
    const { deps, backend, email, token } = await pendingLink();
    const account = await deps.accounts.findByEmail(email);
    if (!account) throw new Error("expected the registered account");
    await deps.accounts.setStatusAndRevokeSessions(account.id, "SUSPENDED");
    expect(await verifyEmail(deps, token)).toMatchObject({
      ok: true,
      outcome: { kind: "UNAVAILABLE" },
      setCookies: [],
    });
    expect(backend.sessions.size).toBe(0);
  });
});
