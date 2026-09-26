import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "../register-owner/register-owner";
import { resendVerification } from "./resend-verification";

async function pendingOwner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(fake.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await fake.settle();
  return { ...fake, email };
}

describe("resendVerification", () => {
  it("AC-AUTH-006 sends a new link and the previous one stops working", async () => {
    const { deps, sender, email } = await pendingOwner();
    const first = tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL"));
    expect(await resendVerification(deps, { email }, meta())).toEqual({ ok: true });
    const second = tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL"));
    expect(second).not.toBe(first);
    expect((await deps.identity.verifyEmail(first)).ok).toBe(false);
    expect((await deps.identity.verifyEmail(second)).ok).toBe(true);
  });

  it("AC-AUTH-006 refuses after 3 resends per hour (A-6)", async () => {
    const { deps, email } = await pendingOwner();
    for (let i = 0; i < 3; i++) await resendVerification(deps, { email }, meta());
    expect(await resendVerification(deps, { email }, meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it("AC-AUTH-003 answers ok for an already verified email and sends nothing", async () => {
    const { deps, sender, email } = await pendingOwner();
    await deps.identity.verifyEmail(tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL")));
    const before = sender.sent.length;
    expect(await resendVerification(deps, { email }, meta())).toEqual({ ok: true });
    expect(sender.sent).toHaveLength(before);
  });

  it("AC-AUTH-022 surfaces a retryable delivery failure (SPEC GAP-4)", async () => {
    const { deps, sender, email } = await pendingOwner();
    sender.failing = true;
    expect(await resendVerification(deps, { email }, meta())).toEqual({
      ok: false,
      code: "EMAIL_DELIVERY_FAILED",
    });
  });
});
