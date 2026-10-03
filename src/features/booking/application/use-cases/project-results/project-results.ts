import "server-only";

import type { z } from "zod";

import { projectFieldErrorKeySchema } from "./project-results.schema";
import type { ProjectFieldErrorKey, ProjectValidationFailure } from "./project-results.types";

/** Maps Zod issues to the stable field-error contract, keeping the first issue per path; unknown messages become INVALID. @param issues - issues from an input schema @returns a validation failure result */
export function toValidationFailure(issues: readonly z.core.$ZodIssue[]): ProjectValidationFailure {
  const fieldErrors: Record<string, ProjectFieldErrorKey> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (path in fieldErrors) continue;
    fieldErrors[path] = projectFieldErrorKeySchema.parse(issue.message);
  }
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}

/** Builds a validation failure from already-keyed field errors. @param fieldErrors - errors by path @returns a validation failure result */
export function validationFailureOf(
  fieldErrors: Readonly<Record<string, ProjectFieldErrorKey>>,
): ProjectValidationFailure {
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}
