import "server-only";

import type { z } from "zod";

import { galleryFieldErrorKeySchema } from "./gallery-results.schema";
import type {
  GalleryDomainCode,
  GalleryDomainFailure,
  GalleryFieldErrorKey,
  GalleryValidationFailure,
} from "./gallery-results.types";

/** Maps Zod issues to the stable field-error contract, keeping the first issue per path. @param issues - issues from an input schema @returns a validation failure result */
export function toGalleryValidationFailure(
  issues: readonly z.core.$ZodIssue[],
): GalleryValidationFailure {
  const fieldErrors: Record<string, GalleryFieldErrorKey> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (path in fieldErrors) continue;
    fieldErrors[path] = galleryFieldErrorKeySchema.parse(issue.message);
  }
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}

/** Builds a validation failure from already-keyed field errors. @param fieldErrors - errors by path @returns a validation failure result */
export function galleryFieldFailure(
  fieldErrors: Readonly<Record<string, GalleryFieldErrorKey>>,
): GalleryValidationFailure {
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}

/** Builds a domain failure result. @param code - the domain code @returns the failure */
export function galleryFailure(code: GalleryDomainCode): GalleryDomainFailure {
  return { ok: false, code };
}
