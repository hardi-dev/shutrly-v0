import type { ProjectFieldRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { formatWeekdayDate } from "@/features/booking/domain/session/session";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { ProjectTranslate } from "../project-copy/project-copy.types";

/**
 * Formats a stored booking value for reading: dates with weekday, booleans as Yes/No, and null when empty.
 * @param t - the project translator
 * @param field - the snapshotted field
 * @param locale - the formatting locale for dates
 * @returns the display text or null
 */
export function displayBookingValue(
  t: ProjectTranslate,
  field: ProjectFieldRecord,
  locale: FormattingLocale,
): string | null {
  const { value } = field;
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? t("fieldYes") : t("fieldNo");
  return field.fieldType === "DATE" ? formatWeekdayDate(value, locale) : value;
}
