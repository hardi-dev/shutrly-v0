import "server-only";

import {
  buildMetricTiles,
  DASHBOARD_TABLE_LIMIT,
  metricWindows,
} from "@/features/booking/domain/dashboard-metrics/dashboard-metrics";
import { projectSearchSchema } from "@/features/booking/domain/project-list-query/project-list-query.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DashboardOverviewReaderPort } from "../../ports/dashboard-overview-reader/dashboard-overview-reader.port";
import type { DashboardOverview, DashboardOverviewInput } from "./load-dashboard-overview.types";

/** Loads the dashboard overview: the four tiles and one page of active projects, read in parallel from one clock instant (AC-DASH-022…037). @param reader - overview reader @param context - verified workspace @param input - search, filter and now @returns the overview */
export async function loadDashboardOverview(
  reader: DashboardOverviewReaderPort,
  context: WorkspaceContext,
  input: DashboardOverviewInput,
): Promise<DashboardOverview> {
  const windows = metricWindows(input.now);
  const search = projectSearchSchema.safeParse(input.q).data ?? null;
  const [facts, page] = await Promise.all([
    reader.readMetrics(context, windows),
    reader.listActiveProjects(context, {
      search,
      filter: input.filter,
      today: windows.today,
      limit: DASHBOARD_TABLE_LIMIT,
    }),
  ]);
  return {
    tiles: buildMetricTiles(facts, windows),
    today: windows.today,
    table: { rows: page.rows, total: page.total, search, filter: input.filter },
  };
}
