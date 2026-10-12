import "server-only";

import { createDrizzleSetupFactsReader } from "@/adapters/db/setup-facts-reader/drizzle-setup-facts-reader";
import { loadSetupChecklist } from "@/features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist";

import { withRequestDb } from "../../request-db/request-db";
import { enterWorkspace } from "../owner-workspace/owner-workspace";
import type { DashboardData } from "./dashboard-flow.types";

/** Verifies and opens the workspace, then loads its setup checklist (F-25). @param rawId - untrusted route ID @returns the workspace summary and the checklist, or null once it has a project */
export async function loadDashboard(rawId: string): Promise<DashboardData> {
  const verified = await enterWorkspace(rawId);
  const checklist = await withRequestDb((db) =>
    loadSetupChecklist(createDrizzleSetupFactsReader(db), verified.context),
  );
  return { workspace: verified.workspace, checklist };
}
