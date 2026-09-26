import { PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { and, eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { account, user } from "@/adapters/db/schema/auth/auth";
import { continueAfterSignIn } from "@/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in";
import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, meta, openAuthHarness } from "./helpers/auth-harness";
import { googleCallback } from "./helpers/google-callback";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

const claims = (email: string, verified = true) => ({
  sub: crypto.randomUUID(),
  email,
  email_verified: verified,
  name: "Alya Google",
});

async function usersWith(email: string): Promise<number> {
  const rows = await h.db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${email}`);
  return rows.length;
}

async function googleAccount(userId: AuthUserId) {
  const google = and(eq(account.userId, userId), eq(account.providerId, "google"));
  return (await h.db.select().from(account).where(google)).at(0);
}

async function owner(verified: boolean) {
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await h.settle();
  if (verified)
    await h.deps.identity.verifyEmail(tokenFrom(h.sender.lastUrl(email, "VERIFY_EMAIL")));
  const found = await h.deps.accounts.findByEmail(email);
  if (!found) throw new Error("fixture: registration failed");
  return { email, userId: found.id };
}

describe("Google sign-in (ADR-012)", () => {
  it("AC-AUTH-025 requests exactly openid email profile", async () => {
    const { url } = await h.deps.identity.googleSignInUrl({
      callbackURL: "/auth/continue",
      errorCallbackURL: "/login",
    });
    expect(new URL(url).searchParams.get("scope")?.split(" ").sort()).toEqual([
      "email",
      "openid",
      "profile",
    ]);
  });

  it("AC-AUTH-024 AC-AUTH-025 creates one verified password-less account and stores no tokens", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    const result = await googleCallback(h, claims(email));
    expect(result).toMatchObject({ path: "/auth/continue", error: null });
    const created = await h.deps.accounts.findByEmail(email);
    expect(created).toMatchObject({ status: "ACTIVE", emailVerified: true, hasPassword: false });
    if (!created) throw new Error("expected the created account");
    expect(await googleAccount(created.id)).toMatchObject({
      accessToken: null,
      refreshToken: null,
      idToken: null,
    });
  });

  it("AC-AUTH-026 links to an existing verified account and keeps its password", async () => {
    const { email, userId } = await owner(true);
    const result = await googleCallback(h, claims(email));
    expect(result.error).toBeNull();
    expect(await usersWith(email)).toBe(1);
    expect(await h.deps.identity.getSessionUserId(cookieHeaders(result.setCookies))).toBe(userId);
    expect((await h.deps.accounts.getById(userId))?.hasPassword).toBe(true);
  });

  it("AC-AUTH-027 BR-AUTH-007 takes over an unverified pre-registration safely", async () => {
    const { email, userId } = await owner(false);
    const squatter = await h.deps.identity.signInWithPassword(
      { email, password: PASSWORD },
      new Headers(),
    );
    const result = await googleCallback(h, claims(email));
    expect(result.error).toBeNull();
    expect(await h.deps.accounts.getById(userId)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    if (squatter.ok)
      expect(await h.deps.identity.getSessionUserId(cookieHeaders(squatter.setCookies))).toBeNull();
  });

  it("AC-AUTH-028 refuses an unverified Google email and creates or links nothing", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    expect((await googleCallback(h, claims(email, false))).path).toBe("/login");
    expect(await usersWith(email)).toBe(0);
    const existing = await owner(true);
    expect((await googleCallback(h, claims(existing.email, false))).path).toBe("/login");
    expect(await googleAccount(existing.userId)).toBeUndefined();
  });

  it("AC-AUTH-029 a cancelled consent creates nothing and returns to login", async () => {
    expect(await googleCallback(h, "cancel")).toMatchObject({
      path: "/login",
      error: "access_denied",
    });
  });

  it("AC-AUTH-031 a suspended Google owner ends with no session", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    await googleCallback(h, claims(email));
    const created = await h.deps.accounts.findByEmail(email);
    if (!created) throw new Error("expected the created account");
    await h.deps.accounts.setStatusAndRevokeSessions(created.id, "SUSPENDED");
    await googleCallback(h, claims(email));
    expect(await continueAfterSignIn(h.deps, created.id)).toEqual({
      kind: "UNAVAILABLE",
      path: "/account-unavailable",
    });
  });
});
