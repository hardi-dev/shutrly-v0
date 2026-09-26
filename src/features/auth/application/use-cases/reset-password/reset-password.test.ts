import { NEW_PASSWORD, OTHER_NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { resetPassword } from "./reset-password";

function owner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified: true } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  const linkFor = async () => {
    await fake.deps.identity.sendResetLink(email);
    await fake.deps.outbox.flush();
    return tokenFrom(fake.sender.lastUrl(email, "RESET_PASSWORD"));
  };
  return { ...fake, email, userId, linkFor };
}

const values = (token: string, password = NEW_PASSWORD, confirm = password) => ({
  token,
  password,
  confirm,
});

describe("resetPassword", () => {
  it("AC-AUTH-017 changes the password, revokes every session and burns the link", async () => {
    const { deps, backend, email, userId, linkFor } = owner();
    const otherDevice = backend.signIn(userId);
    const token = await linkFor();
    expect(await resetPassword(deps, values(token))).toEqual({ ok: true });
    expect(await deps.identity.getSessionUserId(otherDevice)).toBeNull();
    const signIn = await deps.identity.signInWithPassword(
      { email, password: NEW_PASSWORD },
      new Headers(),
    );
    expect(signIn.ok).toBe(true);
    expect(await resetPassword(deps, values(token, OTHER_NEW_PASSWORD))).toEqual({
      ok: false,
      code: "INVALID_LINK",
    });
  });

  it("AC-AUTH-018 a superseded or tampered link leaves the password unchanged", async () => {
    const { deps, email, linkFor } = owner();
    const first = await linkFor();
    await linkFor();
    const invalid = { ok: false, code: "INVALID_LINK" };
    expect(await resetPassword(deps, values(first))).toEqual(invalid);
    expect(await resetPassword(deps, values("tampered"))).toEqual(invalid);
    expect(await resetPassword(deps, values(""))).toEqual(invalid);
    const credentials = { email, password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-002 validates the new password and the confirmation", async () => {
    const { deps } = owner();
    expect(await resetPassword(deps, values("t", "short"))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { password: "password.length" },
    });
    expect(await resetPassword(deps, values("t", NEW_PASSWORD, OTHER_NEW_PASSWORD))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { confirm: "password.mismatch" },
    });
  });
});
