import "server-only";

import { validateFieldValues } from "@/features/booking/domain/booking-field-value/booking-field-value";
import { needsSession } from "@/features/booking/domain/project-status/project-status";
import { sessionInputSchema } from "@/features/booking/domain/session/session.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { fieldValuesInputSchema } from "../../schemas/project-edit-input/project-edit-input.schema";
import { toValidationFailure, validationFailureOf } from "../project-results/project-results";
import type {
  ProjectFieldErrorKey,
  ProjectWriteResult,
} from "../project-results/project-results.types";
import { editProject } from "./edit-project";

/** Changes the booking field values; names and types stay as snapshotted (AC-PRJ-017). @param repository - project port @param context - verified workspace @param actorId - the owner @param projectId - the project @param input - untrusted `{ values }` @returns undefined or a failure */
export function updateProjectFieldValues(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<ProjectWriteResult> {
  const parsed = fieldValuesInputSchema.safeParse(input);
  if (!parsed.success) return Promise.resolve(toValidationFailure(parsed.error.issues));
  return editProject(repository, context, projectId, "deal", async (_locked, writer) => {
    const checked = validateFieldValues(await writer.listFields(), parsed.data.values);
    const errors: Record<string, ProjectFieldErrorKey> = {};
    for (const [key, problem] of Object.entries(checked.problems)) {
      errors[`fieldValues.${key}`] = problem;
    }
    if (Object.keys(errors).length > 0) return validationFailureOf(errors);
    await writer.updateFieldValues(checked.values, actorId);
    return undefined;
  });
}

/** Adds a session while the project is not cancelled (AC-PRJ-029). @param repository - project port @param context - verified workspace @param actorId - the owner @param projectId - the project @param input - untrusted session @returns undefined or a failure */
export function addProjectSession(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<ProjectWriteResult> {
  const parsed = sessionInputSchema.safeParse(input);
  if (!parsed.success) return Promise.resolve(toValidationFailure(parsed.error.issues));
  return editProject(repository, context, projectId, "schedule", async (_locked, writer) => {
    await writer.addSession(parsed.data, actorId);
    return undefined;
  });
}

/** Changes a session while the project is not cancelled (AC-PRJ-029). @param repository - project port @param context - verified workspace @param actorId - the owner @param projectId - the project @param sessionId - the session @param input - untrusted session @returns undefined or a failure */
export function updateProjectSession(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  sessionId: string,
  input: unknown,
): Promise<ProjectWriteResult> {
  const parsed = sessionInputSchema.safeParse(input);
  if (!parsed.success) return Promise.resolve(toValidationFailure(parsed.error.issues));
  return editProject(repository, context, projectId, "schedule", async (_locked, writer) => {
    if (!(await writer.updateSession(sessionId, parsed.data, actorId))) {
      throw new ProjectError("NOT_FOUND");
    }
    return undefined;
  });
}

/** Deletes a session; the last one stays once the project is booked (BR-TEAM-003, AC-PRJ-029). @param repository - project port @param context - verified workspace @param projectId - the project @param sessionId - the session @returns undefined or a failure */
export function deleteProjectSession(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  sessionId: string,
): Promise<ProjectWriteResult> {
  return editProject(repository, context, projectId, "schedule", async (locked, writer) => {
    if (needsSession(locked.status) && locked.sessionCount <= 1) {
      return { ok: false, code: "LAST_SESSION" };
    }
    if (!(await writer.deleteSession(sessionId))) throw new ProjectError("NOT_FOUND");
    return undefined;
  });
}
