import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { requestPasswordReset } from "./request-password-reset";

function owner(password: string | null = PASSWORD) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  fake.backend.seedUser({ name: "Alya", email, password, status: "ACTIVE", emailVerified: true });
  return { ...fake, email };
}

describe("requestPasswordReset", () => {
  it("AC-AUTH-016 answers the same for registered and unknown emails", async () => {
    const { deps, sender, settle, email } = owner();
    const unknown = uniqueEmail();
    expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    expect(await requestPasswordReset(deps, { email: unknown }, meta())).toEqual({ ok: true });
    await settle();
    expect(sender.linksTo(email, "RESET_PASSWORD")).toHaveLength(1);
    expect(sender.linksTo(unknown, "RESET_PASSWORD")).toHaveLength(0);
  });

  it("AC-AUTH-016 silently stops sending after 3 per hour", async () => {
    const { deps, sender, settle, email } = owner();
    for (let i = 0; i < 4; i++) {
      expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    }
    await settle();
    expect(sender.linksTo(email, "RESET_PASSWORD")).toHaveLength(3);
  });

  it("AC-AUTH-030 BR-AUTH-008 a Google-only account gets the confirmation but no email", async () => {
    const { deps, sender, settle, email } = owner(null);
    expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    await settle();
    expect(sender.sent).toHaveLength(0);
  });

  it("AC-AUTH-002 validates the email on the server", async () => {
    const { deps } = owner();
    expect(await requestPasswordReset(deps, { email: "nope" }, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid" },
    });
  });
});
