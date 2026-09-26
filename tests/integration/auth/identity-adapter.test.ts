import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, openAuthHarness } from "./helpers/auth-harness";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

async function registered() {
  const email = normaliseEmail(uniqueEmail());
  const created = await h.deps.identity.createPasswordUser({
    name: "Owner",
    email,
    password: PASSWORD,
  });
  expect(created).toEqual({ created: true });
  return email;
}

async function linkFor(email: string, kind: "VERIFY_EMAIL" | "RESET_PASSWORD") {
  await h.deps.outbox.flush();
  return tokenFrom(h.sender.lastUrl(email, kind));
}

describe("Better Auth identity adapter", () => {
  it("AC-AUTH-003 a second registration for the same email creates nothing", async () => {
    const email = await registered();
    const again = await h.deps.identity.createPasswordUser({
      name: "X",
      email,
      password: WRONG_PASSWORD,
    });
    expect(again).toEqual({ created: false });
  });

  it("AC-AUTH-004 emails verification links to our /verify/confirm route", async () => {
    const email = await registered();
    await h.deps.identity.sendVerificationLink(email);
    await h.deps.outbox.flush();
    expect(new URL(h.sender.lastUrl(email, "VERIFY_EMAIL") ?? "").pathname).toBe("/verify/confirm");
  });

  it("AC-AUTH-005 AC-AUTH-006 a verification link works once and a newer one supersedes it", async () => {
    const email = await registered();
    await h.deps.identity.sendVerificationLink(email);
    const first = await linkFor(email, "VERIFY_EMAIL");
    await h.deps.identity.sendVerificationLink(email);
    const second = await linkFor(email, "VERIFY_EMAIL");
    expect(second).not.toBe(first);
    expect((await h.deps.identity.verifyEmail(first)).ok).toBe(false);
    expect((await h.deps.identity.verifyEmail(second)).ok).toBe(true);
    expect((await h.deps.identity.verifyEmail(second)).ok).toBe(false);
  });

  it("AC-AUTH-018 reset links are single-use and superseded", async () => {
    const email = await registered();
    await h.deps.identity.sendResetLink(email);
    const first = await linkFor(email, "RESET_PASSWORD");
    await h.deps.identity.sendResetLink(email);
    const second = await linkFor(email, "RESET_PASSWORD");
    expect(await h.deps.identity.isResetLinkUsable(first)).toBe(false);
    expect(await h.deps.identity.resetPassword({ token: first, newPassword: "new-horse-1" })).toBe(
      false,
    );
    expect(await h.deps.identity.resetPassword({ token: second, newPassword: "new-horse-1" })).toBe(
      true,
    );
    expect(await h.deps.identity.resetPassword({ token: second, newPassword: "new-horse-2" })).toBe(
      false,
    );
  });

  it("AC-AUTH-008 signs in with the right password only", async () => {
    const email = await registered();
    const wrong = await h.deps.identity.signInWithPassword(
      { email, password: WRONG_PASSWORD },
      new Headers(),
    );
    expect(wrong.ok).toBe(false);
    const right = await h.deps.identity.signInWithPassword(
      { email, password: PASSWORD },
      new Headers(),
    );
    if (!right.ok) throw new Error("expected a session");
    expect(await h.deps.identity.getSessionUserId(cookieHeaders(right.setCookies))).toBe(
      right.userId,
    );
  });
});
