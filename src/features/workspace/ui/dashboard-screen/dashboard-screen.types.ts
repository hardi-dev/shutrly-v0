import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface DashboardScreenProps {
  workspaceId: string;
  workspaceName: string;
  created?: boolean;
  checklist: SetupChecklist | null;
}

export interface DashboardPlaceholderProps {
  readonly workspaceId: string;
  readonly workspaceName: string;
}
