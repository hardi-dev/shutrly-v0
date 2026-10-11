import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";

import type { TeamTranslate } from "../team-copy/team-copy.types";

/**
 * Maps a role-name validation key to its field feedback.
 * @param t - the team translator
 * @param key - a stable key from the schema or the server
 * @returns the message to show under the field
 */
export function teamRoleErrorText(t: TeamTranslate, key: string): string {
  if (key === "TOO_LONG") return t("roleErrorTooLong");
  if (key === "DUPLICATE") return t("roleErrorDuplicate");
  return t("roleErrorEmpty");
}

/**
 * Maps a member field's validation key to its field feedback (deck §8.4).
 * @param t - the team translator
 * @param field - the form field the key belongs to
 * @param key - a stable key from the schema or the server
 * @param holder - the member who already uses the number, for the `TAKEN` key
 * @returns the message to show under the field
 */
export function teamMemberErrorText(
  t: TeamTranslate,
  field: "name" | "whatsappNumber" | "email" | "roleIds",
  key: string,
  holder?: NumberHolder,
): string {
  if (field === "name") return t(key === "TOO_LONG" ? "nameTooLong" : "nameEmpty");
  if (field === "email") return t("emailInvalid");
  if (field === "roleIds") return t("rolesRequired");
  if (key === "TAKEN" && holder) {
    return holder.isArchived
      ? t("whatsappTakenArchived", { name: holder.name })
      : t("whatsappTaken", { name: holder.name });
  }
  return t(key === "REQUIRED" ? "whatsappRequired" : "whatsappInvalid");
}
