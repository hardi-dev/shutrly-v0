import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { updateOwnerLocale } from "./update-owner-locale";

function signedInOwner(emailVerified = true) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  return { ...fake, userId, headers: fake.backend.signIn(userId) };
}

describe("updateOwnerLocale", () => {
  it("BR-L10N-001 stores the chosen locale on the owner's own record", async () => {
    const { deps, userId, headers } = signedInOwner();
    expect(await updateOwnerLocale(deps, { locale: "id" }, headers)).toEqual({ ok: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({ locale: "id" });
  });

  it("C-101 ignores a userId in the input and changes only the session owner", async () => {
    const { deps, backend, userId, headers } = signedInOwner();
    const other = backend.seedUser({
      name: "Other",
      email: normaliseEmail(uniqueEmail()),
      password: PASSWORD,
      emailVerified: true,
      status: "ACTIVE",
    });
    await updateOwnerLocale(deps, { locale: "id", userId: other }, headers);
    expect(await deps.accounts.getById(userId)).toMatchObject({ locale: "id" });
    expect(await deps.accounts.getById(other)).toMatchObject({ locale: "en" });
  });

  it("BR-L10N-001 rejects a locale outside en and id", async () => {
    const { deps, userId, headers } = signedInOwner();
    expect(await updateOwnerLocale(deps, { locale: "fr" }, headers)).toMatchObject({
      ok: false,
      code: "VALIDATION_FAILED",
    });
    expect(await deps.accounts.getById(userId)).toMatchObject({ locale: "en" });
  });

  it("AC-AUTH-009 refuses an unverified session", async () => {
    const { deps, headers } = signedInOwner(false);
    await expect(updateOwnerLocale(deps, { locale: "id" }, headers)).rejects.toMatchObject({
      code: "EMAIL_UNVERIFIED",
    });
  });
});
