import "server-only";

import type { z } from "zod";

import { DomainError } from "@/shared/errors/domain-error";

import { fieldErrorKeySchema } from "./auth-errors.schema";
import type { AuthErrorCode, AuthFailure, FieldErrors } from "./auth-errors.types";

/** A refused auth request that the edge turns into a redirect or a status code. */
export class AuthError extends DomainError {
  readonly code: AuthErrorCode;

  /**
   * @param code - the stable refusal code
   */
  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

/**
 * Build the failure result a use case returns for an expected refusal.
 * @param code - the stable error code
 * @param fieldErrors - optional message keys per field
 * @returns the `{ ok: false }` result
 */
export function failure(code: AuthErrorCode, fieldErrors?: FieldErrors): AuthFailure {
  return fieldErrors ? { ok: false, code, fieldErrors } : { ok: false, code };
}

/**
 * Turn Zod issues into one message key per field, keeping the first issue of each field.
 * @param error - the error from `safeParse` on an auth schema
 * @returns a `VALIDATION_FAILED` failure with `fieldErrors`
 */
export function validationFailure(error: z.ZodError): AuthFailure {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    const key = fieldErrorKeySchema.safeParse(issue.message);
    // Auth schemas only use FieldErrorKey messages; anything else is a bug in a schema.
    if (!key.success) throw new Error(`Auth schema message on "${field}" is not a FieldErrorKey`);
    fieldErrors[field] ??= key.data;
  }
  return failure("VALIDATION_FAILED", fieldErrors);
}
