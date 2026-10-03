import "server-only";

import {
  canCancel,
  cancelReasonRequired,
} from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { cancelProjectInputSchema } from "../../schemas/project-info-input/project-info-input.schema";
import { toValidationFailure, validationFailureOf } from "../project-results/project-results";
import type { ProjectWriteResult } from "../project-results/project-results.types";

/** Cancels a BOOKED or SHOOTING project; a reason is required from SHOOTING (BR-PRJ-004, BR-PRJ-010, AC-PRJ-022). @param repository - project port @param context - verified workspace @param actorId - the signed-in owner @param projectId - the project id @param input - untrusted `{ reason }` @returns undefined on success or a failure result */
export async function cancelProject(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<ProjectWriteResult> {
  const parsed = cancelProjectInputSchema.safeParse(input);
  if (!parsed.success) return toValidationFailure(parsed.error.issues);
  const { reason } = parsed.data;
  const result = await repository.withLockedProject<ProjectWriteResult>(
    context,
    projectId,
    async (locked, writer) => {
      if (!canCancel(locked.status)) return { ok: false, code: "STALE" };
      if (cancelReasonRequired(locked.status) && reason === null) {
        return validationFailureOf({ reason: "REASON_REQUIRED" });
      }
      await writer.cancel({ reason, actorId });
      return undefined;
    },
  );
  if (result === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return result;
}
