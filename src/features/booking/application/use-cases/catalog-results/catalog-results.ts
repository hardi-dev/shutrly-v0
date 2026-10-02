import "server-only";

import type { z } from "zod";

import type { CatalogValidationFailure } from "./catalog-results.types";

export function validationFailure(issue: z.core.$ZodIssue | undefined): CatalogValidationFailure {
  const path = issue?.path ?? ["name"];
  return {
    ok: false,
    code: "VALIDATION_FAILED",
    fieldErrors: { [path.length > 0 ? path.join(".") : "name"]: issue?.message ?? "INVALID" },
  };
}
