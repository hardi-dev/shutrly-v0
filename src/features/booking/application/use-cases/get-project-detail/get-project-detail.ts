import "server-only";

import {
  isDealEditable,
  isScheduleEditable,
  nextStep,
} from "@/features/booking/domain/project-status/project-status";
import { pickShownSession } from "@/features/booking/domain/session/session";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import type { ProjectDetailView } from "./get-project-detail.types";

/** Loads one project in the verified workspace with what the detail page needs; a missing or foreign project is NOT_FOUND (AC-PRJ-025). @param repository - project port @param context - verified workspace @param projectId - the project id @param today - YYYY-MM-DD in the schedule zone @returns the project detail view */
export async function getProjectDetail(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  today: string,
): Promise<ProjectDetailView> {
  const detail = await repository.findDetail(context, projectId);
  if (detail === null) throw new ProjectError("NOT_FOUND");
  return {
    ...detail,
    shownSession: pickShownSession(detail.sessions, today),
    nextStep: nextStep(detail.status),
    canEditDeal: isDealEditable(detail.status),
    canEditSchedule: isScheduleEditable(detail.status),
    canEditInfo: isScheduleEditable(detail.status),
  };
}
