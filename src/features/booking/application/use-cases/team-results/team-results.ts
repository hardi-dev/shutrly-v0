import "server-only";

import type { z } from "zod";

import { teamRoleFieldErrorKeySchema } from "./team-results.schema";
import type { TeamRoleValidationFailure } from "./team-results.types";

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
