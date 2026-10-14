import "server-only";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import type {
  MetricFacts,
  MetricWindows,
} from "@/features/booking/domain/dashboard-metrics/dashboard-metrics.types";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** An active-projects row: the list row plus the agreed price, which the table shows (AC-DASH-026). */
export interface ActiveProjectRow extends ProjectListRow {
  /** The decimal amount in IDR, canonical (D-9). */
  readonly agreedPrice: string;
}

export interface ActiveProjectsQuery {
  readonly search: string | null;
  readonly filter: ProjectFilter | null;
  /** YYYY-MM-DD in the schedule zone; the next session is the one from this day on. */
  readonly today: string;
  readonly limit: number;
}

export interface ActiveProjectsPage {
  readonly rows: readonly ActiveProjectRow[];
  /** The count after search and filter, before the limit. */
  readonly total: number;
}

/** Read-side port for the workspace dashboard overview (D-3). Both reads are scoped to the workspace. */
export interface DashboardOverviewReaderPort {
  /** The eight counts and the two monthly series, cut at `windows.now`. */
  readonly readMetrics: (context: WorkspaceContext, windows: MetricWindows) => Promise<MetricFacts>;
  /** One page of active projects with the dashboard's order and total. */
  readonly listActiveProjects: (
    context: WorkspaceContext,
    query: ActiveProjectsQuery,
  ) => Promise<ActiveProjectsPage>;
}
