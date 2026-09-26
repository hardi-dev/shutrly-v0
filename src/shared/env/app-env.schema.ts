import { z } from "zod";

// Worker bindings read per request. Features extend this object with their own keys.
export const appEnvSchema = z.object({
  DATABASE_URL: z.url(),
  APP_STAGE: z.enum(["development", "test", "production"]),
  // F-01 Auth (ADR-002, ADR-011, ADR-012). Secrets come from Worker secret bindings.
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  AUTH_EMAIL_FROM: z.string().min(3),
  // E2E only: "1" keeps auth emails in memory on a localhost BETTER_AUTH_URL.
  E2E_EMAIL_CAPTURE: z.enum(["1"]).optional(),
});
