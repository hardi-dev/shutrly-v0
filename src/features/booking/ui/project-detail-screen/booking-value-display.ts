import type { ProjectFieldRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { formatWeekdayDate } from "@/features/booking/domain/session/session";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

/** Formats a stored booking value for reading: dates with weekday, booleans as Ya/Tidak, and null when empty. @param field - the snapshotted field @returns the display text or null */
export function displayBookingValue(
  field: ProjectFieldRecord,
  locale: FormattingLocale,
): string | null {
  const { value } = field;
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? PROJECT_COPY.fieldYes : PROJECT_COPY.fieldNo;
  return field.fieldType === "DATE" ? formatWeekdayDate(value, locale) : value;
}
