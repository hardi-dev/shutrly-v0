import "server-only";

import { createDrizzleSetupFactsReader } from "@/adapters/db/setup-facts-reader/drizzle-setup-facts-reader";
import { loadDashboardOverview } from "@/composition/booking/dashboard-overview-flow/dashboard-overview-flow";
import type { ProjectListParams } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import { loadSetupChecklist } from "@/features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist";

import { withRequestDb } from "../../request-db/request-db";
import { enterWorkspace } from "../owner-workspace/owner-workspace";
import type { DashboardData } from "./dashboard-flow.types";

/** Verifies and opens the workspace, then shows the setup checklist until it has a project; from then on the dashboard overview (F-25, F-26). @param rawId - untrusted route ID @param params - the raw search params for the overview's table @returns the workspace summary, the checklist, and the overview once there is no checklist */
export async function loadDashboard(
  rawId: string,
  params: ProjectListParams = {},
): Promise<DashboardData> {
  const verified = await enterWorkspace(rawId);
  const checklist = await withRequestDb((db) =>
    loadSetupChecklist(createDrizzleSetupFactsReader(db), verified.context),
  );
  const overview =
    checklist === null ? await loadDashboardOverview(verified.context, params, new Date()) : null;
  return { workspace: verified.workspace, checklist, overview };
}
