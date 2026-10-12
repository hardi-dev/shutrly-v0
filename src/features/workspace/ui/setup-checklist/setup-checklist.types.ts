import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface SetupChecklistProps {
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly checklist: SetupChecklist;
}
