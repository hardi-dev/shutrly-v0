import { NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { user } from "@/adapters/db/schema/auth/auth";
import { renderAuthEmail } from "@/adapters/email/auth-email-templates/auth-email-templates";
import { requireOwner } from "@/features/auth/application/policy/owner-access/owner-access";
import { changePassword } from "@/features/auth/application/use-cases/change-password/change-password";
import { loginOwner } from "@/features/auth/application/use-cases/login-owner/login-owner";
import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import { requestPasswordReset } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset";
import { resetPassword } from "@/features/auth/application/use-cases/reset-password/reset-password";
import { verifyEmail } from "@/features/auth/application/use-cases/verify-email/verify-email";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, meta, openAuthHarness } from "./helpers/auth-harness";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

async function verifiedOwner() {
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await h.settle();
  const verified = await verifyEmail(h.deps, tokenFrom(h.sender.lastUrl(email, "VERIFY_EMAIL")));
  if (!verified.ok) throw new Error("fixture: verification failed");
  return { email, headers: cookieHeaders(verified.setCookies) };
}

async function signIn(email: string, password = PASSWORD): Promise<Headers> {
  const result = await loginOwner(h.deps, { email, password }, meta());
  if (!result.ok) throw new Error(`fixture: sign-in failed (${result.code})`);
  return cookieHeaders(result.setCookies);
}

describe("auth flows on the real adapters", () => {
  it("AC-AUTH-001 AC-AUTH-004 register → verify → owner session → onboarding hand-off", async () => {
    const { email, headers } = await verifiedOwner();
    const owner = await requireOwner(h.deps, headers);
    expect(owner).toMatchObject({ email, status: "ACTIVE", emailVerified: true });
  });

  it("AC-AUTH-009 an unverified sign-in is restricted to /verify", async () => {
    const email = normaliseEmail(uniqueEmail());
    await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
    const result = await loginOwner(h.deps, { email, password: PASSWORD }, meta());
    expect(result).toMatchObject({ ok: true, outcome: { kind: "RESTRICTED", path: "/verify" } });
  });

  it("AC-AUTH-014 a surviving session is refused once the status is no longer ACTIVE", async () => {
    const { email, headers } = await verifiedOwner();
    await h.db.update(user).set({ status: "SUSPENDED" }).where(eq(user.email, email));
    await expect(requireOwner(h.deps, headers)).rejects.toMatchObject({
      code: "ACCOUNT_UNAVAILABLE",
    });
  });

  it("AC-AUTH-017 a reset revokes every session and the new password works", async () => {
    const { email, headers } = await verifiedOwner();
    await requestPasswordReset(h.deps, { email }, meta());
    await h.settle();
    const token = tokenFrom(h.sender.lastUrl(email, "RESET_PASSWORD"));
    const reset = await resetPassword(h.deps, {
      token,
      password: NEW_PASSWORD,
      confirm: NEW_PASSWORD,
    });
    expect(reset).toEqual({ ok: true });
    expect(await h.deps.identity.getSessionUserId(headers)).toBeNull();
    await expect(signIn(email, NEW_PASSWORD)).resolves.toBeInstanceOf(Headers);
  });

  it("AC-AUTH-019 a password change keeps this session and revokes the others", async () => {
    const { email } = await verifiedOwner();
    const current = await signIn(email);
    const other = await signIn(email);
    const input = { currentPassword: PASSWORD, newPassword: NEW_PASSWORD, confirm: NEW_PASSWORD };
    const result = await changePassword(h.deps, input, current);
    if (!result.ok) throw new Error(`expected success (${result.code})`);
    const refreshed = result.setCookies.length > 0 ? cookieHeaders(result.setCookies) : current;
    expect(await h.deps.identity.getSessionUserId(refreshed)).not.toBeNull();
    expect(await h.deps.identity.getSessionUserId(other)).toBeNull();
  });
});

describe("auth emails in the screen language (D-17)", () => {
  it("D-17 a register request in Indonesian sends the Indonesian verification email", async () => {
    const id = await openAuthHarness({ locale: "id" });
    try {
      const email = normaliseEmail(uniqueEmail());
      await registerOwner(id.deps, { name: "Alya", email, password: PASSWORD }, meta());
      await id.settle();
      const link = id.sender.linksTo(email, "VERIFY_EMAIL").at(0);
      if (!link) throw new Error("expected a verification link");
      expect(link.locale).toBe("id");
      expect(renderAuthEmail(link).subject).toBe("Verifikasi email Shutrly kamu");
    } finally {
      await id.close();
    }
  });
});

describe("the sign-up language becomes the owner's language (D-22)", () => {
  async function storedLocale(harness: AuthHarness, email: string): Promise<string | undefined> {
    const rows = await harness.db
      .select({ locale: user.locale })
      .from(user)
      .where(eq(user.email, email));
    return rows.at(0)?.locale;
  }

  it("D-22 a register request in Indonesian stores user.locale id", async () => {
    const id = await openAuthHarness({ locale: "id" });
    try {
      const email = normaliseEmail(uniqueEmail());
      await registerOwner(id.deps, { name: "Alya", email, password: PASSWORD }, meta());
      await id.settle();
      expect(await storedLocale(id, email)).toBe("id");
    } finally {
      await id.close();
    }
  });

  it("D-22 a register request without a choice stores en", async () => {
    const email = normaliseEmail(uniqueEmail());
    await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
    await h.settle();
    expect(await storedLocale(h, email)).toBe("en");
  });
});
