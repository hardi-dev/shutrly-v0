import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { formatShortDate } from "@/features/booking/domain/session/session";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { projectStatusChip } from "../project-status-chip/project-status-props";
import type { ProjectMenuTarget } from "./project-menu-host.types";

/** Builds the row menu's target from a list row, so the project list and the dashboard share one menu (AC-DASH-030). @param t - the project translator @param row - the row @param locale - the formatting locale @returns the menu target */
export function rowTarget(
  t: ProjectTranslate,
  row: ProjectListRow,
  locale: FormattingLocale,
): ProjectMenuTarget {
  const when =
    row.shownSession === null
      ? t("metaNoSchedule")
      : formatShortDate(row.shownSession.date, locale);
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    hasTeam: row.hasTeam,
    clientId: row.clientId,
    clientName: row.clientName,
    whatsappNumber: row.clientWhatsappNumber,
    meta: t("menuSheetMeta", {
      client: row.clientName,
      when,
      status: projectStatusChip(t, row.status).label,
    }),
  };
}
