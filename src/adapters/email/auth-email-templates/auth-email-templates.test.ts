import { describe, expect, it } from "vitest";

import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { renderAuthEmail } from "./auth-email-templates";
import { AUTH_EMAIL_COPY } from "./auth-email-templates.copy";

const verify: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "owner@example.com",
  name: "Alya <b>",
  url: "https://app.shutrly.dev/verify/confirm?token=t&x=1",
};

describe("renderAuthEmail", () => {
  it("AC-AUTH-001 puts the link in the text body and escapes the name and URL in HTML", () => {
    const mail = renderAuthEmail(verify);
    expect(mail.subject).toBe(AUTH_EMAIL_COPY.VERIFY_EMAIL.subject);
    expect(mail.text).toContain(verify.url);
    expect(mail.html).toContain("Alya &lt;b&gt;");
    expect(mail.html).toContain("token=t&amp;x=1");
  });

  it("AC-AUTH-005 AC-AUTH-018 states each link's lifetime (A-3)", () => {
    expect(renderAuthEmail(verify).text).toContain(AUTH_EMAIL_COPY.VERIFY_EMAIL.expiry);
    const reset = renderAuthEmail({ ...verify, kind: "RESET_PASSWORD" });
    expect(reset.subject).toBe(AUTH_EMAIL_COPY.RESET_PASSWORD.subject);
    expect(reset.text).toContain(AUTH_EMAIL_COPY.RESET_PASSWORD.expiry);
  });
});
