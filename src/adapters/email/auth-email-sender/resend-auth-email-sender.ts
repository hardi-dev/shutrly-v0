import "server-only";

import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type {
  AuthEmailPort,
  AuthLink,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

import { renderAuthEmail } from "../auth-email-templates/auth-email-templates";
import type { ResendConfig } from "./resend-auth-email-sender.types";

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Auth emails through Resend's HTTP API with `fetch`, which works on Workers (ADR-011).
 * @param config - the API key, the sender address and an optional `fetch` for tests
 * @returns the `AuthEmailPort`; `send` throws `EmailDeliveryError` without the link or recipient
 */
export function createResendAuthEmailSender(config: ResendConfig): AuthEmailPort {
  const doFetch = config.fetch ?? fetch;
  const post = (link: AuthLink): Promise<Response> => {
    const mail = renderAuthEmail(link);
    return doFetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.from, to: [link.to], ...mail }),
    });
  };
  return {
    async send(link) {
      // The network error is dropped on purpose: it may echo request details (C-103).
      const response = await post(link).catch(() => null);
      if (!response) throw new EmailDeliveryError(link.kind);
      if (!response.ok) throw new EmailDeliveryError(link.kind, response.status);
    },
  };
}
