import type { ReactNode } from "react";

import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface DashboardScreenProps {
  workspaceId: string;
  workspaceName: string;
  created?: boolean;
  checklist: SetupChecklist | null;
  /** The dashboard overview; rendered when there is no checklist (F-26). */
  overview?: ReactNode;
}
