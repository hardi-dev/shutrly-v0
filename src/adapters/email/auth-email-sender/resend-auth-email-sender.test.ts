import { describe, expect, it, vi } from "vitest";

import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { createResendAuthEmailSender } from "./resend-auth-email-sender";

const verify: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "owner@example.com",
  name: "Alya",
  url: "https://app.shutrly.dev/verify/confirm?token=secret-token",
};

describe("Resend auth email sender (ADR-011)", () => {
  it("AC-AUTH-001 posts the rendered email to Resend with the API key", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("{}", { status: 200 })));
    const sender = createResendAuthEmailSender({
      apiKey: "re_k",
      from: "S <a@x.dev>",
      fetch: fetchMock,
    });
    await sender.send(verify);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_k" });
    const body = JSON.parse(init.body as string) as { to: string[]; text: string };
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.text).toContain(verify.url);
  });

  it("AC-AUTH-021 AC-AUTH-022 throws EmailDeliveryError without the link on HTTP failure", async () => {
    const failing = () => Promise.resolve(new Response("no", { status: 500 }));
    const sender = createResendAuthEmailSender({ apiKey: "k", from: "f", fetch: failing });
    const error: unknown = await sender.send(verify).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(EmailDeliveryError);
    expect(String(error)).not.toContain("secret-token");
  });

  it("AC-AUTH-022 throws EmailDeliveryError on a network failure", async () => {
    const offline = () => Promise.reject(new TypeError("network"));
    const sender = createResendAuthEmailSender({ apiKey: "k", from: "f", fetch: offline });
    await expect(sender.send(verify)).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});
