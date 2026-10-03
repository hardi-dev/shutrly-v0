import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type {
  ProjectDetailRecord,
  ProjectRepositoryPort,
} from "../../ports/project-repository/project-repository.port";

/** Loads one project in the verified workspace; a missing or foreign project is NOT_FOUND (AC-PRJ-025). @param repository - project port @param context - verified workspace @param projectId - the project id @returns the project detail */
export async function getProjectDetail(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
): Promise<ProjectDetailRecord> {
  const detail = await repository.findDetail(context, projectId);
  if (detail === null) throw new ProjectError("NOT_FOUND");
  return detail;
}
