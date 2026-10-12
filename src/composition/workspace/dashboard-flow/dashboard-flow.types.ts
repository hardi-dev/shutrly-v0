import type { WorkspaceSummary } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";
import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface DashboardData {
  readonly workspace: WorkspaceSummary;
  readonly checklist: SetupChecklist | null;
}
