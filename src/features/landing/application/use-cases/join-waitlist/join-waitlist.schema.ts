import { z } from "zod";

import { WAITLIST_EMAIL_MAX_LENGTH } from "@/features/landing/domain/waitlist-email/waitlist-email";

export const waitlistFieldErrorSchema = z.enum([
  "email.required",
  "email.invalid",
  "email.tooLong",
]);

// Shared by the waitlist form and its server action. Messages are WaitlistFieldError keys.
// `website` is the bot field (A-4): any value passes here and the use case drops the entry.
export const joinWaitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "email.required")
    .max(WAITLIST_EMAIL_MAX_LENGTH, "email.tooLong")
    .pipe(z.email("email.invalid")),
  website: z.string(),
});

// The waitlist endpoint's only answers; the browser checks the response against it.
export const joinWaitlistResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("JOINED") }),
  z.object({
    status: z.literal("INVALID"),
    field: z.literal("email"),
    error: waitlistFieldErrorSchema,
  }),
  z.object({ status: z.literal("RATE_LIMITED") }),
  z.object({ status: z.literal("FAILED") }),
]);
