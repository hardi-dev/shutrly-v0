import { useTranslations } from "next-intl";

import {
  displayTime,
  formatSessionDayTime,
  nextSessionLabel,
} from "@/features/booking/domain/session/session";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";

import {
  DASHBOARD_OVERVIEW_COPY_NAMESPACE,
  DASHBOARD_PROJECT_COPY_NAMESPACE,
} from "./dashboard-overview.copy";

/** The next-session column: *No sessions scheduled*, *Today*, *Today, {time}*, or the day and time (AC-DASH-027, D-11). @param props - the next session or null, and today's date @returns the cell text */
export function DashboardNextSession({
  session,
  today,
}: Readonly<{ session: SessionRecordShape | null; today: string }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const tp = useTranslations(DASHBOARD_PROJECT_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  if (session === null) {
    return <span className="text-(--color-semantic-text-muted)">{tp("metaNoSchedule")}</span>;
  }
  const label = nextSessionLabel(session, today);
  if (label.kind === "TODAY") return <span>{t("nextToday")}</span>;
  if (label.kind === "TODAY_AT") {
    return <span>{t("nextTodayAt", { time: displayTime(label.time, locale) })}</span>;
  }
  return <span>{formatSessionDayTime(session, locale)}</span>;
}
