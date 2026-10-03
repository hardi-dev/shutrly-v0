import type { RoleRef } from "../../ports/team-role-repository/team-role-repository.port";

export type TeamRoleFieldErrorKey = "EMPTY" | "TOO_LONG" | "DUPLICATE";

export interface TeamRoleFieldErrors {
  readonly name?: TeamRoleFieldErrorKey;
}

export interface TeamRoleValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: TeamRoleFieldErrors;
}

export type TeamRoleWriteResult =
  { readonly ok: true; readonly role?: RoleRef } | TeamRoleValidationFailure;

export type DeleteTeamRoleResult =
  { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE"; readonly usage: number };
