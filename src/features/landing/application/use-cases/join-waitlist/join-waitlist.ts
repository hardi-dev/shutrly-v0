import "server-only";

import { normalizeWaitlistEmail } from "@/features/landing/domain/waitlist-email/waitlist-email";

import { WaitlistStoreError } from "../../errors/waitlist-store-error/waitlist-store-error";
import { joinWaitlistSchema, waitlistFieldErrorSchema } from "./join-waitlist.schema";
import type { JoinWaitlistDeps, JoinWaitlistResult } from "./join-waitlist.types";

const JOINED: JoinWaitlistResult = { status: "JOINED" };
const FAILED: JoinWaitlistResult = { status: "FAILED" };

/**
 * Put an email on the waitlist (F-19 main flow). A filled bot field gets the normal success and
 * nothing is stored (A-4); a duplicate is the store's no-op (A-1). The answer never says more.
 * @param input - the submitted form values, untrusted
 * @param deps - the waitlist store (null when not configured) and the failure reporter
 * @returns JOINED, INVALID with the field error, or FAILED
 */
export async function joinWaitlist(
  input: unknown,
  deps: JoinWaitlistDeps,
): Promise<JoinWaitlistResult> {
  const parsed = joinWaitlistSchema.safeParse(input);
  if (!parsed.success) {
    const error = waitlistFieldErrorSchema
      .catch("email.invalid")
      .parse(parsed.error.issues[0]?.message);
    return { status: "INVALID", field: "email", error };
  }
  if (parsed.data.website.trim() !== "") return JOINED;
  if (!deps.store) {
    deps.onFailure({ reason: "NOT_CONFIGURED" });
    return FAILED;
  }
  try {
    await deps.store.add(normalizeWaitlistEmail(parsed.data.email));
    return JOINED;
  } catch (error) {
    const status = error instanceof WaitlistStoreError ? error.status : undefined;
    deps.onFailure({ reason: "STORE_FAILED", status });
    return FAILED;
  }
}
