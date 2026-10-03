import "server-only";

import { isDealEditable } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { projectInfoInputSchema } from "../../schemas/project-info-input/project-info-input.schema";
import { toValidationFailure } from "../project-results/project-results";
import type { ProjectWriteResult } from "../project-results/project-results.types";

/** Changes title, notes and agreed price under the project lock; the price is locked once shooting starts and nothing changes after cancelling (BR-PRJ-009, AC-PRJ-017, 018). @param repository - project port @param context - verified workspace @param actorId - the signed-in owner @param projectId - the project id @param input - untrusted form values @returns undefined on success or a failure result */
export async function updateProjectInfo(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<ProjectWriteResult> {
  const parsed = projectInfoInputSchema.safeParse(input);
  if (!parsed.success) return toValidationFailure(parsed.error.issues);
  const result = await repository.withLockedProject<ProjectWriteResult>(
    context,
    projectId,
    async (locked, writer) => {
      if (locked.status === "CANCELLED") return { ok: false, code: "PROJECT_CANCELLED" };
      if (parsed.data.agreedPrice !== locked.agreedPrice && !isDealEditable(locked.status)) {
        return { ok: false, code: "DEAL_LOCKED" };
      }
      await writer.updateInfo({ ...parsed.data, actorId });
      return undefined;
    },
  );
  if (result === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return result;
}
