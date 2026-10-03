import type { NumberHolder } from "../../ports/client-repository/client-repository.port";
import type { TeamMemberRecord } from "../../ports/team-member-repository/team-member-repository.port";
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

export type TeamMemberFieldErrorKey = "EMPTY" | "TOO_LONG" | "REQUIRED" | "INVALID" | "TAKEN";

export interface TeamMemberFieldErrors {
  readonly name?: TeamMemberFieldErrorKey;
  readonly whatsappNumber?: TeamMemberFieldErrorKey;
  readonly email?: TeamMemberFieldErrorKey;
  readonly roleIds?: TeamMemberFieldErrorKey;
}

export interface TeamMemberValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: TeamMemberFieldErrors;
  readonly numberHolder?: NumberHolder;
}

export interface CreatedTeamMemberRef {
  readonly id: string;
  readonly name: string;
}

export type TeamMemberWriteResult =
  { readonly ok: true; readonly member?: CreatedTeamMemberRef } | TeamMemberValidationFailure;

export interface TeamMemberPage {
  readonly items: readonly TeamMemberRecord[];
  readonly nextCursor: string | null;
}
