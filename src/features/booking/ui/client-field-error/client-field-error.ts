import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";

import { CLIENT_FIELD_ERROR_MESSAGE_KEY } from "../client-copy/client-copy.copy";
import type { ClientTranslate } from "../client-copy/client-copy.types";

const FIELD_MESSAGE_KEYS: ReadonlyMap<string, string> = new Map(
  Object.entries(CLIENT_FIELD_ERROR_MESSAGE_KEY),
);

/**
 * Maps a client validation key to its field feedback (deck §6.4).
 * @param t - the client translator
 * @param key - stable validation key
 * @param holder - optional client using a duplicate number
 * @returns the message to show under the field
 */
export function clientFieldErrorText(
  t: ClientTranslate,
  key: string,
  holder?: NumberHolder,
): string {
  if (key === "TAKEN" && holder) {
    return holder.isArchived
      ? t("fieldTakenByArchived", { name: holder.name })
      : t("fieldTakenBy", { name: holder.name });
  }
  if (key === "TAKEN") return t("fieldTaken");
  return t(FIELD_MESSAGE_KEYS.get(key) ?? "fieldGeneric");
}
