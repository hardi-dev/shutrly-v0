import "server-only";

import { WaitlistStoreError } from "@/features/landing/application/errors/waitlist-store-error/waitlist-store-error";
import type { WaitlistStorePort } from "@/features/landing/application/ports/waitlist-store/waitlist-store.port";

import type { ResendWaitlistConfig } from "./resend-waitlist-store.types";

const RESEND_CONTACTS_URL = "https://api.resend.com/contacts";

/**
 * The waitlist as Resend contacts in one segment (ADR-022). Resend answers a repeated email with
 * the existing contact and keeps its join time, which is the no-op A-1 asks for.
 * @param config - the waitlist API key, the environment's segment ID and an optional `fetch`
 * @returns the `WaitlistStorePort`; `add` throws `WaitlistStoreError` without the email
 */
export function createResendWaitlistStore(config: ResendWaitlistConfig): WaitlistStorePort {
  const doFetch = config.fetch ?? fetch;
  const post = (email: string): Promise<Response> =>
    doFetch(RESEND_CONTACTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false, segments: [{ id: config.segmentId }] }),
    });
  return {
    async add(email) {
      // The network error is dropped on purpose: it may echo the request body (C-006).
      const response = await post(email).catch(() => null);
      if (!response) throw new WaitlistStoreError();
      if (!response.ok) throw new WaitlistStoreError(response.status);
    },
  };
}
