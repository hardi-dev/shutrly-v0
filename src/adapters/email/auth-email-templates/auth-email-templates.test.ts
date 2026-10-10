import { describe, expect, it } from "vitest";

import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { renderAuthEmail } from "./auth-email-templates";
import { AUTH_EMAIL_COPY } from "./auth-email-templates.copy";

const verify: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "owner@example.com",
  name: "Alya <b>",
  url: "https://app.shutrly.dev/verify/confirm?token=t&x=1",
  locale: "en",
};

describe("renderAuthEmail", () => {
  it("AC-AUTH-001 puts the link in the text body and escapes the name and URL in HTML", () => {
    const mail = renderAuthEmail(verify);
    expect(mail.subject).toBe(AUTH_EMAIL_COPY.en.VERIFY_EMAIL.subject);
    expect(mail.text).toContain(verify.url);
    expect(mail.html).toContain("Alya &lt;b&gt;");
    expect(mail.html).toContain("token=t&amp;x=1");
  });

  it("AC-AUTH-005 AC-AUTH-018 states each link's lifetime (A-3)", () => {
    expect(renderAuthEmail(verify).text).toContain(AUTH_EMAIL_COPY.en.VERIFY_EMAIL.expiry);
    const reset = renderAuthEmail({ ...verify, kind: "RESET_PASSWORD" });
    expect(reset.subject).toBe(AUTH_EMAIL_COPY.en.RESET_PASSWORD.subject);
    expect(reset.text).toContain(AUTH_EMAIL_COPY.en.RESET_PASSWORD.expiry);
  });

  it("D-17 renders the verification email in English", () => {
    const mail = renderAuthEmail(verify);
    expect(mail.subject).toBe("Verify your Shutrly email");
    expect(mail.text).toContain("Hi Alya <b>,");
    expect(mail.text).toContain("Confirm your email to finish signing up for Shutrly.");
    expect(mail.text).toContain("This link is valid for 24 hours and can only be used once.");
    expect(mail.html).toContain("Verify email");
  });

  it("D-17 renders the verification email in Indonesian", () => {
    const mail = renderAuthEmail({ ...verify, locale: "id" });
    expect(mail.subject).toBe("Verifikasi email Shutrly kamu");
    expect(mail.text).toContain("Halo Alya <b>,");
    expect(mail.text).toContain("Konfirmasi emailmu untuk menyelesaikan pendaftaran Shutrly.");
    expect(mail.text).toContain("Tautan ini berlaku 24 jam dan hanya bisa dipakai sekali.");
    expect(mail.html).toContain("Verifikasi email");
  });
});
