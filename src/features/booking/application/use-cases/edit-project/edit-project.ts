import "server-only";

import {
  isDealEditable,
  isScheduleEditable,
} from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type {
  LockedProject,
  ProjectRepositoryPort,
  ProjectWriter,
} from "../../ports/project-repository/project-repository.port";
import type { ProjectWriteResult } from "../project-results/project-results.types";

/** Runs one edit under the project lock: deal edits need DRAFT or BOOKED (BR-PRJ-009), schedule edits need a project that is not cancelled (A-6). @param repository - project port @param context - verified workspace @param projectId - the project id @param kind - which rule gates the edit @param change - the edit, run only when the gate passes @returns undefined on success or a failure result */
export async function editProject(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  kind: "deal" | "schedule",
  change: (locked: LockedProject, writer: ProjectWriter) => Promise<ProjectWriteResult>,
): Promise<ProjectWriteResult> {
  const result = await repository.withLockedProject<ProjectWriteResult>(
    context,
    projectId,
    (locked, writer) => {
      if (kind === "deal" && !isDealEditable(locked.status)) {
        return Promise.resolve({ ok: false, code: "DEAL_LOCKED" });
      }
      if (kind === "schedule" && !isScheduleEditable(locked.status)) {
        return Promise.resolve({ ok: false, code: "PROJECT_CANCELLED" });
      }
      return change(locked, writer);
    },
  );
  if (result === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return result;
}
