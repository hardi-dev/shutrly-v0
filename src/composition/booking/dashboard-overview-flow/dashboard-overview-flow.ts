import "server-only";

import { createDrizzleDashboardOverviewReader } from "@/adapters/db/project-repository/drizzle-dashboard-overview-reader";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { loadDashboardOverview as loadOverview } from "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview";
import { loadFilterServices } from "@/features/booking/application/use-cases/load-filter-options/load-filter-options";
import { parseProjectListParams } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectListParams } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withRequestDb } from "../../request-db/request-db";
import type { DashboardOverviewData } from "./dashboard-overview-flow.types";

/** Loads the dashboard overview and the filter's options for a verified workspace. Its reads have no catch of their own: a failure reaches the owner error page (F-26 error handling). @param context - verified workspace @param params - the raw search params (`q` and filter) @param now - the clock instant @returns the overview, filter services and filter client */
export function loadDashboardOverview(
  context: WorkspaceContext,
  params: ProjectListParams,
  now: Date,
): Promise<DashboardOverviewData> {
  const { q, filter } = parseProjectListParams(params, "ACTIVE");
  return withRequestDb(async (db) => {
    const projects = createDrizzleProjectRepository(db);
    const overview = await loadOverview(createDrizzleDashboardOverviewReader(db), context, {
      q: q ?? null,
      filter,
      now,
    });
    return {
      overview,
      services: await loadFilterServices(projects, context),
      filterClient:
        filter.clientId === null ? null : await projects.findFilterClient(context, filter.clientId),
    };
  });
}
