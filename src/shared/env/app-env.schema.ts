import { z } from "zod";

// Worker bindings read per request. Features extend this object with their own keys.
export const appEnvSchema = z
  .object({
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
    // F-09 Gallery (ADR-005, ADR-017). Worker secrets; composition hands them to adapters.
    GOOGLE_DRIVE_API_KEY: z.string().min(1),
    // base64url of exactly 32 bytes: 43 characters, and the last one carries only 4 bits.
    GALLERY_PASSWORD_KEY: z.string().regex(/^[\w-]{42}[AEIMQUYcgkosw048]$/),
    // F-10 Client access (ADR-021): HMAC key for the client session cookie, same format.
    CLIENT_SESSION_KEY: z.string().regex(/^[\w-]{42}[AEIMQUYcgkosw048]$/),
    // E2E only: "1" wires the fixture Drive provider. Refused on production.
    E2E_FAKE_DRIVE: z.enum(["1"]).optional(),
  })
  .refine((env) => env.APP_STAGE !== "production" || env.E2E_FAKE_DRIVE === undefined, {
    path: ["E2E_FAKE_DRIVE"],
  });
