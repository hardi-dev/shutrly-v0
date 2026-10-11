import { formatSessionWhen } from "@/features/booking/domain/session/session";
import type { ShownSession } from "@/features/booking/domain/session/session.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { ProjectTranslate } from "../project-copy/project-copy.types";

const SEPARATOR = " · ";

/**
 * Builds the header line under a project title: next (or last) session, place and how many more (AC-PRJ-015, 018).
 * @param t - the project translator
 * @param clientName - the client, or null to drop it on phones
 * @param shown - the shown session or null
 * @param locale - the formatting locale for the session date
 * @returns e.g. "Rina · Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi"
 */
export function projectMetaText(
  t: ProjectTranslate,
  clientName: string | null,
  shown: ShownSession | null,
  locale: FormattingLocale,
): string {
  const parts: (string | null)[] = [clientName];
  if (shown === null) {
    parts.push(t("metaNoSchedule"));
  } else {
    const label = t(shown.isPast ? "metaLast" : "metaNext");
    parts.push(
      `${label} ${formatSessionWhen(shown.session, locale)}`,
      shown.session.location,
      shown.extraCount > 0 ? t("metaExtra", { count: shown.extraCount }) : null,
    );
  }
  return parts.filter((part) => part !== null).join(SEPARATOR);
}

/**
 * The header meta with a line other than the session, e.g. a delivered project's *Hasil akhir dipublikasikan …* (owner-7 `r71J5`).
 * @param clientName - the client
 * @param line - the line after it
 * @returns the meta
 */
export function projectMetaLine(clientName: string, line: string): string {
  return [clientName, line].join(SEPARATOR);
}
