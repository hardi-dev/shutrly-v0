import "server-only";

import { createResendWaitlistStore } from "@/adapters/email/waitlist-store/resend-waitlist-store";
import { joinWaitlist } from "@/features/landing/application/use-cases/join-waitlist/join-waitlist";
import type {
  JoinWaitlistResult,
  WaitlistFailure,
} from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";
import { logger } from "@/shared/logging/logger";

import { getScopedRequestContext } from "../../request-context/request-context";
import { waitlistEnvSchema } from "./submit-waitlist.schema";

/**
 * Wire the waitlist use case to Resend for this request's environment (ADR-022). Failures are
 * logged with the request ID and the provider status only, never the email (AC-LND-012).
 * @param input - the submitted form values, untrusted
 * @returns the answer for the visitor
 */
export async function submitWaitlist(input: unknown): Promise<JoinWaitlistResult> {
  const context = await getScopedRequestContext(waitlistEnvSchema).catch(() => null);
  if (!context) {
    logger.error("waitlist", { reason: "CONTEXT_FAILED" });
    return { status: "FAILED" };
  }
  const { RESEND_WAITLIST_API_KEY: apiKey, RESEND_WAITLIST_SEGMENT_ID: segmentId } = context.env;
  const store = apiKey && segmentId ? createResendWaitlistStore({ apiKey, segmentId }) : null;
  const onFailure = (failure: WaitlistFailure) => {
    logger.warn("waitlist", { ...failure, requestId: context.requestId });
  };
  return joinWaitlist(input, { store, onFailure });
}
