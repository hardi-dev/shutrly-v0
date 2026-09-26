import "server-only";

import type {
  AuthEmailPort,
  AuthLink,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

import type { CaptureEnv } from "./capturing-email-sender.types";

// E2E only, under local `next dev`: links stay in this process so Playwright can open them.
const captured: AuthLink[] = [];

/**
 * Tell whether E2E email capture may run: the flag is set and the app URL is localhost.
 * @param env - the flag and the app base URL
 * @returns true only for a localhost base URL with `E2E_EMAIL_CAPTURE=1`
 */
export function isEmailCaptureEnabled(env: CaptureEnv): boolean {
  if (env.E2E_EMAIL_CAPTURE !== "1") return false;
  const host = new URL(env.BETTER_AUTH_URL).hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * An email port that keeps links in memory instead of sending them.
 * @returns the capturing `AuthEmailPort`
 */
export function createCapturingEmailSender(): AuthEmailPort {
  return {
    send: (link) => {
      captured.push(link);
      return Promise.resolve();
    },
  };
}

/**
 * The links captured for one recipient, oldest first.
 * @param to - the recipient email
 * @returns the captured links
 */
export function capturedLinks(to: string): AuthLink[] {
  return captured.filter((link) => link.to === to.toLowerCase());
}
