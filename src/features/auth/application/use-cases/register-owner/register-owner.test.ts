import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "./register-owner";

const values = (email: string, password = PASSWORD) => ({ name: "Alya", email, password });

describe("registerOwner", () => {
  it("AC-AUTH-001 creates one ACTIVE unverified identity and emails a verification link", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    expect(await registerOwner(deps, values(`  ${email.toUpperCase()} `), meta())).toEqual({
      ok: true,
      email,
    });
    await settle();
    expect(await deps.accounts.findByEmail(normaliseEmail(email))).toMatchObject({
      status: "ACTIVE",
      emailVerified: false,
      hasPassword: true,
    });
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(1);
  });

  it.each([
    [{ name: "", email: "a@b.co", password: PASSWORD }, { name: "name.required" }],
    [{ name: "A", email: "not-an-email", password: PASSWORD }, { email: "email.invalid" }],
    [{ name: "A", email: "a@b.co", password: "short" }, { password: "password.length" }],
    [{ name: "A", email: "a@b.co", password: "x".repeat(129) }, { password: "password.length" }],
  ])("AC-AUTH-002 rejects invalid input on the server: %o", async (bad, fieldErrors) => {
    const { deps, backend } = fakeAuthDeps();
    expect(await registerOwner(deps, bad, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors,
    });
    expect(backend.users.size).toBe(0);
  });

  it("AC-AUTH-003 an existing unverified email gets the same answer and a fresh link", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    await registerOwner(deps, values(email), meta());
    expect(await registerOwner(deps, values(email, WRONG_PASSWORD), meta())).toEqual({
      ok: true,
      email,
    });
    await settle();
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(2);
    const credentials = { email: normaliseEmail(email), password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-003 an existing verified email gets the same answer and no email", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    await registerOwner(deps, values(email), meta());
    await settle();
    await deps.identity.verifyEmail(tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL")));
    expect(await registerOwner(deps, values(email), meta())).toEqual({ ok: true, email });
    await settle();
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(1);
  });

  it("AC-AUTH-010 refuses the 4th registration for one email within an hour (A-6)", async () => {
    const { deps } = fakeAuthDeps();
    const email = uniqueEmail();
    for (let i = 0; i < 3; i++) await registerOwner(deps, values(email), meta());
    expect(await registerOwner(deps, values(email), meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it("AC-AUTH-022 a provider failure still records the account and answers the same", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    sender.failing = true;
    const email = uniqueEmail();
    expect(await registerOwner(deps, values(email), meta())).toEqual({ ok: true, email });
    await settle();
    expect(await deps.accounts.findByEmail(normaliseEmail(email))).not.toBeNull();
  });
});
