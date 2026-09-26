import { NEW_PASSWORD, PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { changePassword } from "./change-password";

function signedInOwner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified: true } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  return { ...fake, email, userId, headers: fake.backend.signIn(userId) };
}

const values = (currentPassword: string) => ({
  currentPassword,
  newPassword: NEW_PASSWORD,
  confirm: NEW_PASSWORD,
});

describe("changePassword", () => {
  it("AC-AUTH-019 keeps the current session and revokes the others", async () => {
    const { deps, backend, email, userId, headers } = signedInOwner();
    const other = backend.signIn(userId);
    expect(await changePassword(deps, values(PASSWORD), headers)).toMatchObject({ ok: true });
    expect(await deps.identity.getSessionUserId(headers)).toBe(userId);
    expect(await deps.identity.getSessionUserId(other)).toBeNull();
    const credentials = { email, password: NEW_PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-019 a wrong current password changes nothing and flags the field", async () => {
    const { deps, email, headers } = signedInOwner();
    expect(await changePassword(deps, values(WRONG_PASSWORD), headers)).toEqual({
      ok: false,
      code: "WRONG_CURRENT_PASSWORD",
      fieldErrors: { currentPassword: "password.wrongCurrent" },
    });
    const credentials = { email, password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-002 requires a matching confirmation", async () => {
    const { deps, headers } = signedInOwner();
    const input = { ...values(PASSWORD), confirm: WRONG_PASSWORD };
    expect(await changePassword(deps, input, headers)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { confirm: "password.mismatch" },
    });
  });

  it("AC-AUTH-014 refuses a session without an owner", async () => {
    const { deps } = signedInOwner();
    await expect(changePassword(deps, values(PASSWORD), new Headers())).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
  });
});
