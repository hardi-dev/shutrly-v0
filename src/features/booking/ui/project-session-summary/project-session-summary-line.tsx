import type { ShownSession } from "@/features/booking/domain/session/session.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";

import { projectMetaText } from "./project-session-summary";

/** The phone header's session line, without the client (AC-PRJ-015), or the given meta (Owner 7). */
export function ProjectSessionSummaryLine({
  shown,
  meta,
}: Readonly<{ shown: ShownSession | null; meta?: string }>) {
  const locale = useFormattingLocale();
  return (
    <p className="text-(length:--font-size-body-sm) text-(--component-page-header-subtitle)">
      {meta ?? projectMetaText(null, shown, locale)}
    </p>
  );
}
