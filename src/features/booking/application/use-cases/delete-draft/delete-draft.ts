import "server-only";

import { canDeleteDraft } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import type { DeleteDraftResult } from "./delete-draft.types";

/** Deletes a DRAFT with its snapshots; any other status answers STALE (BR-PRJ-010, AC-PRJ-023). @param repository - project port @param context - verified workspace @param projectId - the project id @returns the deleted title or a failure */
export async function deleteDraft(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
): Promise<DeleteDraftResult> {
  const result = await repository.withLockedProject<DeleteDraftResult>(
    context,
    projectId,
    async (locked, writer) => {
      if (!canDeleteDraft(locked.status)) return { ok: false, code: "STALE" };
      await writer.deleteProject();
      return { ok: true, title: locked.title };
    },
  );
  if (result === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return result;
}
