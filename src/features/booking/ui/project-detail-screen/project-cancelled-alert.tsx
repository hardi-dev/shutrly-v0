import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import { todayInScheduleZone } from "@/features/booking/domain/schedule-clock/schedule-clock";
import { formatWeekdayDate } from "@/features/booking/domain/session/session";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

/** The warning shown first on a cancelled project: who cancelled, when and why. */
export function ProjectCancelledAlert({
  cancellation,
}: Readonly<{ cancellation: NonNullable<ProjectDetailView["cancellation"]> }>) {
  const locale = useFormattingLocale();
  const date = formatWeekdayDate(todayInScheduleZone(new Date(cancellation.at)), locale);
  const who =
    cancellation.byName === null
      ? PROJECT_COPY.cancelledAnonymous(date)
      : PROJECT_COPY.cancelledBy(cancellation.byName, date);
  const body = cancellation.reason
    ? `${who} ${PROJECT_COPY.cancelledReason(cancellation.reason)}`
    : who;
  return <Alert tone="warning" title={PROJECT_COPY.cancelledTitle} body={body} />;
}
