import { joinWaitlistResultSchema } from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.schema";
import type {
  JoinWaitlistInput,
  JoinWaitlistResult,
} from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";

const WAITLIST_URL = "/api/waitlist";
// Netlify's edge rate limit answers 429 before the request reaches the app (ADR-022, A-2).
const TOO_MANY_REQUESTS = 429;
const FAILED: JoinWaitlistResult = { status: "FAILED" };

/**
 * Send the waitlist form to the public endpoint and read its answer. A rejected `fetch` (offline)
 * propagates; the form's hook turns it into the failure message.
 * @param input - the form values
 * @returns the endpoint's answer, RATE_LIMITED on HTTP 429, FAILED on anything unexpected
 */
export async function postWaitlist(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
  const response = await fetch(WAITLIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === TOO_MANY_REQUESTS) return { status: "RATE_LIMITED" };
  if (!response.ok) return FAILED;
  const parsed = joinWaitlistResultSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : FAILED;
}
