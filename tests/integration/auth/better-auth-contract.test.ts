import { NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAuth } from "@/adapters/auth/create-auth/create-auth";
import type { Auth, IssuedToken } from "@/adapters/auth/create-auth/create-auth.types";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { parseAppEnv } from "@/shared/env/app-env";

import { openTestDb } from "../helpers/test-db";

// Pins the Better Auth 1.7.6 behaviour the plan relies on. If an upgrade breaks one of these,
// revisit the plan's "Verified library facts" before changing code (ADR-012).
let db: Db;
let close: () => Promise<void>;
let auth: Auth;
const issued: IssuedToken[] = [];

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  auth = createAuth({
    database: createBetterAuthDatabase(db),
    env: parseAppEnv(process.env),
    onToken: (token) => {
      issued.push(token);
      return Promise.resolve();
    },
    onGoogleClaims: () => Promise.resolve(),
  });
});
afterAll(() => close());

function lastToken(email: string, kind: IssuedToken["kind"]): string {
  const token = issued.findLast((t) => t.user.email === email && t.kind === kind)?.token;
  if (!token) throw new Error(`no ${kind} token for ${email}`);
  return token;
}

async function signUp(): Promise<string> {
  const email = uniqueEmail();
  await auth.api.signUpEmail({ body: { name: "Owner", email, password: PASSWORD } });
  return email;
}

describe("Better Auth 1.7.6 contract", () => {
  it("AC-AUTH-001 sign-up creates an ACTIVE unverified user without a session", async () => {
    const email = uniqueEmail();
    const body = { name: "Owner", email, password: PASSWORD };
    const { headers } = await auth.api.signUpEmail({ body, returnHeaders: true });
    expect(headers.getSetCookie()).toHaveLength(0);
    const [row] = await db.select().from(user).where(eq(user.email, email));
    expect(row).toMatchObject({ status: "ACTIVE", emailVerified: false });
  });

  it("AC-AUTH-004 verifying signs in and sets email_verified_at through the hook", async () => {
    const email = await signUp();
    await auth.api.sendVerificationEmail({ body: { email } });
    const query = { token: lastToken(email, "VERIFY_EMAIL") };
    const { headers } = await auth.api.verifyEmail({ query, returnHeaders: true });
    expect(headers.getSetCookie().join(";")).toContain("session_token");
    const rows = await db.select().from(user).where(eq(user.email, email));
    expect(rows.at(0)?.emailVerifiedAt).toBeInstanceOf(Date);
  });

  it("AC-AUTH-005 R-2 verification tokens are reusable, so the link registry must guard them", async () => {
    const email = await signUp();
    await auth.api.sendVerificationEmail({ body: { email } });
    const query = { token: lastToken(email, "VERIFY_EMAIL") };
    await auth.api.verifyEmail({ query });
    await expect(auth.api.verifyEmail({ query })).resolves.toBeDefined();
  });

  it("AC-AUTH-018 R-2 an older reset token still works after a newer one is issued", async () => {
    const email = await signUp();
    await auth.api.requestPasswordReset({ body: { email } });
    const first = lastToken(email, "RESET_PASSWORD");
    await auth.api.requestPasswordReset({ body: { email } });
    const body = { token: first, newPassword: NEW_PASSWORD };
    await expect(auth.api.resetPassword({ body })).resolves.toBeDefined();
  });

  it("AC-AUTH-009 an unverified user can sign in; the restriction is ours to enforce", async () => {
    const email = await signUp();
    const body = { email, password: PASSWORD };
    const { headers } = await auth.api.signInEmail({ body, returnHeaders: true });
    expect(headers.getSetCookie().join(";")).toContain("session_token");
  });
});
