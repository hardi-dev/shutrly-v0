import { useTranslations } from "next-intl";

import {
  displayTime,
  formatSessionDayTime,
  nextSessionLabel,
} from "@/features/booking/domain/session/session";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";

import type { NextSessionTexts } from "./dashboard-next-session.types";
import {
  DASHBOARD_OVERVIEW_COPY_NAMESPACE,
  DASHBOARD_PROJECT_COPY_NAMESPACE,
} from "./dashboard-overview.copy";

/** The copy and the formatting locale of the next-session label, read once per component (AC-DASH-027). @returns the texts and the locale */
export function useNextSessionTexts(): { texts: NextSessionTexts; locale: FormattingLocale } {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const tp = useTranslations(DASHBOARD_PROJECT_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const texts: NextSessionTexts = {
    none: tp("metaNoSchedule"),
    today: t("nextToday"),
    todayAt: (time) => t("nextTodayAt", { time: displayTime(time, locale) }),
  };
  return { texts, locale };
}

/** The next-session label as text: *No sessions scheduled*, *Today*, *Today, {time}*, or the day and time with no year (D-11). @param session - the next session or null @param today - YYYY-MM-DD in the schedule zone @param texts - the copy @param locale - the formatting locale @returns the label */
export function nextSessionText(
  session: SessionRecordShape | null,
  today: string,
  texts: NextSessionTexts,
  locale: FormattingLocale,
): string {
  if (session === null) return texts.none;
  const label = nextSessionLabel(session, today);
  if (label.kind === "TODAY") return texts.today;
  if (label.kind === "TODAY_AT") return texts.todayAt(label.time);
  return formatSessionDayTime(session, locale);
}

/** The next-session column of the desktop table. @param props - the next session or null, and today's date @returns the cell text */
export function DashboardNextSession({
  session,
  today,
}: Readonly<{ session: SessionRecordShape | null; today: string }>) {
  const { texts, locale } = useNextSessionTexts();
  const className = session === null ? "text-(--color-semantic-text-muted)" : undefined;
  return <span className={className}>{nextSessionText(session, today, texts, locale)}</span>;
}
