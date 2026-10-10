import { formatSessionWhen } from "@/features/booking/domain/session/session";
import type { ShownSession } from "@/features/booking/domain/session/session.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

const SEPARATOR = " · ";

/** Builds the header line under a project title: next (or last) session, place and how many more (AC-PRJ-015, 018). @param clientName - the client, or null to drop it on phones @param shown - the shown session or null @returns e.g. "Rina · Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi" */
export function projectMetaText(
  clientName: string | null,
  shown: ShownSession | null,
  locale: FormattingLocale,
): string {
  const parts: (string | null)[] = [clientName];
  if (shown === null) {
    parts.push(PROJECT_COPY.metaNoSchedule);
  } else {
    const label = shown.isPast ? PROJECT_COPY.metaLast : PROJECT_COPY.metaNext;
    parts.push(
      `${label} ${formatSessionWhen(shown.session, locale)}`,
      shown.session.location,
      shown.extraCount > 0 ? PROJECT_COPY.metaExtra(shown.extraCount) : null,
    );
  }
  return parts.filter((part) => part !== null).join(SEPARATOR);
}

/** The header meta with a line other than the session, e.g. a delivered project's *Hasil akhir dipublikasikan …* (owner-7 `r71J5`). @param clientName - the client @param line - the line after it @returns the meta */
export function projectMetaLine(clientName: string, line: string): string {
  return [clientName, line].join(SEPARATOR);
}
