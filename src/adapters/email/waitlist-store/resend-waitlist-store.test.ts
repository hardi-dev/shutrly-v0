import { describe, expect, it, vi } from "vitest";

import { WaitlistStoreError } from "@/features/landing/application/errors/waitlist-store-error/waitlist-store-error";

import { createResendWaitlistStore } from "./resend-waitlist-store";

const config = { apiKey: "re_test", segmentId: "11111111-1111-4111-8111-111111111111" };

function answering(response: Response | Error) {
  return vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  );
}

describe("createResendWaitlistStore", () => {
  it("ADR-022 creates a subscribed contact in the environment's segment", async () => {
    const fetch = answering(new Response(null, { status: 201 }));
    await createResendWaitlistStore({ ...config, fetch }).add("rina@example.com");
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/contacts");
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_test" });
    expect(JSON.parse(init.body as string)).toEqual({
      email: "rina@example.com",
      unsubscribed: false,
      segments: [{ id: config.segmentId }],
    });
  });

  it("AC-LND-010 throws the provider status when Resend refuses", async () => {
    const store = createResendWaitlistStore({
      ...config,
      fetch: answering(new Response(null, { status: 401 })),
    });
    await expect(store.add("rina@example.com")).rejects.toMatchObject({ status: 401 });
  });

  it("AC-LND-012 drops the network error so the email can't leak through it", async () => {
    const fetch = answering(new Error("connect failed for rina@example.com"));
    const error = await createResendWaitlistStore({ ...config, fetch })
      .add("rina@example.com")
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(WaitlistStoreError);
    expect(String(error)).not.toContain("rina@example.com");
  });
});
