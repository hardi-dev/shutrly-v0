import "server-only";

import type { z } from "zod";

import type { NumberHolder } from "../../ports/client-repository/client-repository.port";
import {
  teamMemberFieldErrorKeySchema,
  teamMemberFieldSchema,
  teamRoleFieldErrorKeySchema,
} from "./team-results.schema";
import type {
  TeamMemberFieldErrors,
  TeamMemberValidationFailure,
  TeamRoleValidationFailure,
} from "./team-results.types";

/**
 * Maps role-name issues to the stable field-error contract.
 * @param issues - issues from the role input schema
 * @returns a validation failure carrying the name error
 */
export function teamRoleValidationFailure(
  issues: readonly z.core.$ZodIssue[],
): TeamRoleValidationFailure {
  const first = issues.at(0);
  return {
    ok: false,
    code: "VALIDATION_FAILED",
    fieldErrors: first ? { name: teamRoleFieldErrorKeySchema.parse(first.message) } : {},
  };
}

/**
 * Builds the failure for a role name another role already uses (BR-TEAM-005).
 * @returns a validation failure with the `DUPLICATE` name error
 */
export function teamRoleDuplicate(): TeamRoleValidationFailure {
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "DUPLICATE" } };
}

/**
 * Maps member-input issues to the stable field-error contract, keeping the first issue per field.
 * @param issues - issues from the member input schema
 * @returns a validation failure carrying one error per field
 */
export function teamMemberValidationFailure(
  issues: readonly z.core.$ZodIssue[],
): TeamMemberValidationFailure {
  const fieldErrors: { -readonly [K in keyof TeamMemberFieldErrors]: TeamMemberFieldErrors[K] } =
    {};
  for (const issue of issues) {
    const field = teamMemberFieldSchema.safeParse(issue.path.at(0));
    if (!field.success || field.data in fieldErrors) continue;
    fieldErrors[field.data] = teamMemberFieldErrorKeySchema.parse(issue.message);
  }
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
}

/**
 * Builds the failure for a number another member already holds (BR-TEAM-004).
 * @param holder - the member using the number
 * @returns a validation failure with the `TAKEN` number error and the holder
 */
export function teamMemberNumberTaken(holder: NumberHolder): TeamMemberValidationFailure {
  return {
    ok: false,
    code: "VALIDATION_FAILED",
    fieldErrors: { whatsappNumber: "TAKEN" },
    numberHolder: holder,
  };
}
