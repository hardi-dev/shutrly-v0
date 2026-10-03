import "server-only";

import type { z } from "zod";

import type { NumberHolder } from "../../ports/client-repository/client-repository.port";
import { clientFieldErrorKeySchema } from "./client-results.schema";
import type { ClientValidationFailure } from "./client-results.types";

/** Maps validation issues to the stable field-error contract, preserving the first issue per path. @param issues - issues from the input schema @returns a validation failure result */
export function validationFailure(issues: readonly z.core.$ZodIssue[]): ClientValidationFailure {
  const fieldErrors: Record<string, ClientValidationFailure["fieldErrors"][string]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (path in fieldErrors) continue;
    fieldErrors[path] = clientFieldErrorKeySchema.parse(issue.message);
  }
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}

/** Converts a repository unique-number result into the stable validation contract. @param holder - the client already using the number @returns a validation failure result */
export function numberTaken(holder: NumberHolder): ClientValidationFailure {
  return {
    ok: false,
    code: "VALIDATION_FAILED",
    fieldErrors: { whatsappNumber: "TAKEN" },
    numberHolder: holder,
  };
}
