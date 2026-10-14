import type { DashboardOverviewData } from "@/composition/booking/dashboard-overview-flow/dashboard-overview-flow.types";
import type { WorkspaceSummary } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";
import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface DashboardData {
  readonly workspace: WorkspaceSummary;
  readonly checklist: SetupChecklist | null;
  /** The overview once the workspace has a project; null while the checklist shows. */
  readonly overview: DashboardOverviewData | null;
}
