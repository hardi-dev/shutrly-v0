import {
  FIELD_ERROR_FALLBACK_MESSAGE_KEY,
  FIELD_VALUE_ERROR_MESSAGE_KEY,
  PROJECT_FIELD_ERROR_MESSAGE_KEY,
} from "../project-copy/project-copy.copy";
import type { ProjectTranslate } from "../project-copy/project-copy.types";

const MAX_PRICE_VALUE = 999_999_999_999;

function fieldValueMessage(t: ProjectTranslate, key: string, fieldName: string): string {
  const messageKey = FIELD_VALUE_ERROR_MESSAGE_KEY[key] ?? FIELD_ERROR_FALLBACK_MESSAGE_KEY.VALUE;
  return t(messageKey, { fieldName });
}

/**
 * Maps a project validation key to the field feedback for the active locale.
 * @param t - the project translate function (a component's or a copy-test translator)
 * @param path - the field path, e.g. "title" or "fieldValues.nama_kampus"
 * @param key - stable validation key
 * @param fieldName - the booking field's display name for fieldValues paths
 * @returns the message to show under the field
 */
export function projectFieldErrorText(
  t: ProjectTranslate,
  path: string,
  key: string,
  fieldName = "",
): string {
  if (path.startsWith("fieldValues.")) return fieldValueMessage(t, key, fieldName);
  const leaf = path.split(".").at(-1) ?? path;
  const messageKey = PROJECT_FIELD_ERROR_MESSAGE_KEY[leaf]?.[key];
  if (messageKey === undefined) return t(FIELD_ERROR_FALLBACK_MESSAGE_KEY.GENERIC);
  return t(messageKey, { fieldName, maxPrice: MAX_PRICE_VALUE });
}
