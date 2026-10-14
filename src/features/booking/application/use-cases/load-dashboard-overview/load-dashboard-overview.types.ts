import type { MetricTiles } from "@/features/booking/domain/dashboard-metrics/dashboard-metrics.types";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";

import type { ActiveProjectRow } from "../../ports/dashboard-overview-reader/dashboard-overview-reader.port";

export interface DashboardOverviewInput {
  /** The raw `q` search param; blank or invalid means no search. */
  readonly q: string | null;
  readonly filter: ProjectFilter | null;
  readonly now: Date;
}

export interface DashboardOverview {
  readonly tiles: MetricTiles;
  /** YYYY-MM-DD in the schedule zone; the next-session label is relative to it. */
  readonly today: string;
  readonly table: {
    readonly rows: readonly ActiveProjectRow[];
    readonly total: number;
    readonly search: string | null;
    readonly filter: ProjectFilter | null;
  };
}
