import type { SetupStep } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

export interface SetupChecklistRowProps {
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly step: SetupStep;
  readonly isLast?: boolean;
}
