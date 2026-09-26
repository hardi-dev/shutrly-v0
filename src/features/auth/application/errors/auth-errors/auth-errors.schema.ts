import { z } from "zod";

// Stable codes the edge maps to screens and messages (technical-design.md › Error Handling).
export const authErrorCodeSchema = z.enum([
  "VALIDATION_FAILED",
  "INVALID_CREDENTIALS",
  "RATE_LIMITED",
  "EMAIL_UNVERIFIED",
  "ACCOUNT_UNAVAILABLE",
  "AUTH_REQUIRED",
  "INVALID_LINK",
  "WRONG_CURRENT_PASSWORD",
  "GOOGLE_CANCELLED",
  "GOOGLE_FAILED",
  "EMAIL_DELIVERY_FAILED",
]);

// Zod messages in auth schemas are these keys; each form's *.copy.ts translates them.
export const fieldErrorKeySchema = z.enum([
  "name.required",
  "name.tooLong",
  "email.invalid",
  "password.required",
  "password.length",
  "password.mismatch",
  "password.wrongCurrent",
]);
