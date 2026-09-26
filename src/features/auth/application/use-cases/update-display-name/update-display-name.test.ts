import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { updateDisplayName } from "./update-display-name";

function signedInOwner(emailVerified = true) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  return { ...fake, email, userId, headers: fake.backend.signIn(userId) };
}

describe("updateDisplayName", () => {
  it("AC-AUTH-020 updates the name on the single user record; the email cannot change", async () => {
    const { deps, email, userId, headers } = signedInOwner();
    const input = { name: "  Alya Pratama ", email: "other@example.com" };
    expect(await updateDisplayName(deps, input, headers)).toEqual({ ok: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({ name: "Alya Pratama", email });
  });

  it("AC-AUTH-020 rejects an empty name", async () => {
    const { deps, headers } = signedInOwner();
    expect(await updateDisplayName(deps, { name: "   " }, headers)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "name.required" },
    });
  });

  it("AC-AUTH-009 refuses an unverified session", async () => {
    const { deps, headers } = signedInOwner(false);
    await expect(updateDisplayName(deps, { name: "X" }, headers)).rejects.toMatchObject({
      code: "EMAIL_UNVERIFIED",
    });
  });
});
