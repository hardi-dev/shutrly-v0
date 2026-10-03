import type { ShownSession } from "@/features/booking/domain/session/session.types";

import { projectMetaText } from "./project-session-summary";

/** The phone header's session line, without the client (AC-PRJ-015). */
export function ProjectSessionSummaryLine({ shown }: Readonly<{ shown: ShownSession | null }>) {
  return (
    <p className="text-(length:--font-size-body-sm) text-(--component-page-header-subtitle)">
      {projectMetaText(null, shown)}
    </p>
  );
}
