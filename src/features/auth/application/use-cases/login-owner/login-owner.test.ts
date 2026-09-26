import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail, uniqueIp } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { loginOwner } from "./login-owner";

function owner(status: AccountStatus = "ACTIVE", emailVerified = true, password = PASSWORD) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const userId = fake.backend.seedUser({ name: "Alya", email, password, status, emailVerified });
  return { ...fake, email, userId };
}

describe("loginOwner", () => {
  it("AC-AUTH-007 a verified active owner gets a session and the workspace hand-off", async () => {
    const { deps, email } = owner();
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toMatchObject({
      ok: true,
      outcome: { kind: "OWNER", path: "/onboarding/workspace" },
    });
  });

  it("AC-AUTH-008 unknown email and wrong password give the same generic failure", async () => {
    const { deps, email } = owner();
    const unknown = await loginOwner(deps, { email: uniqueEmail(), password: PASSWORD }, meta());
    const wrong = await loginOwner(deps, { email, password: WRONG_PASSWORD }, meta());
    expect(unknown).toEqual({ ok: false, code: "INVALID_CREDENTIALS" });
    expect(wrong).toEqual(unknown);
  });

  it("AC-AUTH-002 validates input on the server", async () => {
    const { deps } = owner();
    expect(await loginOwner(deps, { email: "nope", password: "" }, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid", password: "password.required" },
    });
  });

  it("AC-AUTH-009 an unverified owner gets a restricted session pointed at /verify", async () => {
    const { deps, email } = owner("ACTIVE", false);
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toMatchObject({
      ok: true,
      outcome: { kind: "RESTRICTED", path: "/verify" },
    });
  });

  it("AC-AUTH-010 after 5 failures the correct password is refused too", async () => {
    const { deps, email } = owner();
    const ip = uniqueIp();
    const from = { ip, headers: new Headers() };
    for (let i = 0; i < 5; i++) await loginOwner(deps, { email, password: WRONG_PASSWORD }, from);
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it.each(["SUSPENDED", "DISABLED"] as const)(
    "AC-AUTH-013 a %s owner gets no session",
    async (status) => {
      const { deps, backend, email } = owner(status);
      expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toEqual({
        ok: false,
        code: "ACCOUNT_UNAVAILABLE",
      });
      expect(backend.sessions.size).toBe(0);
    },
  );

  it("AC-AUTH-030 a Google-only account gets the generic password-login error", async () => {
    const fake = fakeAuthDeps();
    const email = normaliseEmail(uniqueEmail("google"));
    const seed = { name: "Alya", email, password: null, status: "ACTIVE", emailVerified: true };
    fake.backend.seedUser({ ...seed, status: "ACTIVE" });
    expect(await loginOwner(fake.deps, { email, password: PASSWORD }, meta())).toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });
  });
});
