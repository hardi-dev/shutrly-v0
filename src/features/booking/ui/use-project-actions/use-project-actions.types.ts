import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";

export type AdvanceProjectCall = (
  workspaceId: string,
  projectId: string,
  step: ProjectStep,
) => Promise<ProjectWriteResult>;

export interface UseProjectActionsInput {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly advanceAction: AdvanceProjectCall;
}
