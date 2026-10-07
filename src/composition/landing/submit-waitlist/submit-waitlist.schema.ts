import { z } from "zod";

// The only bindings the waitlist reads (ADR-022). Optional: without them a submission answers
// with the failure message (AC-LND-018). Kept out of AppEnv so the landing-only production needs
// no database or other feature secrets (ADR-021).
export const waitlistEnvSchema = z.object({
  RESEND_WAITLIST_API_KEY: z.string().min(1).optional(),
  RESEND_WAITLIST_SEGMENT_ID: z.uuid().optional(),
});
