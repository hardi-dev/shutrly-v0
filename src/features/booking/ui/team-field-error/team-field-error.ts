import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";

import { TEAM_COPY } from "../team-copy/team-copy.copy";

/**
 * Maps a role-name validation key to its Indonesian field feedback.
 * @param key - a stable key from the schema or the server
 * @returns the message to show under the field
 */
export function teamRoleErrorText(key: string): string {
  if (key === "TOO_LONG") return TEAM_COPY.roleErrors.TOO_LONG;
  if (key === "DUPLICATE") return TEAM_COPY.roleErrors.DUPLICATE;
  return TEAM_COPY.roleErrors.EMPTY;
}

/**
 * Maps a member field's validation key to its Indonesian field feedback.
 * @param field - the form field the key belongs to
 * @param key - a stable key from the schema or the server
 * @param holder - the member who already uses the number, for the `TAKEN` key
 * @returns the message to show under the field
 */
export function teamMemberErrorText(
  field: "name" | "whatsappNumber" | "email" | "roleIds",
  key: string,
  holder?: NumberHolder,
): string {
  const errors = TEAM_COPY.memberErrors;
  if (field === "name") return key === "TOO_LONG" ? errors.nameTooLong : errors.nameEmpty;
  if (field === "email") return errors.emailInvalid;
  if (field === "roleIds") return errors.rolesRequired;
  if (key === "TAKEN" && holder) return errors.whatsappTaken(holder.name, holder.isArchived);
  return key === "REQUIRED" ? errors.whatsappRequired : errors.whatsappInvalid;
}
