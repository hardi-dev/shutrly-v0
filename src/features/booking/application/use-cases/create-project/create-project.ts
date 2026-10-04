import "server-only";

import { z } from "zod";

import { validateFieldValues } from "@/features/booking/domain/booking-field-value/booking-field-value";
import { validateItemList } from "@/features/booking/domain/project-items/project-items";
import { hasDuplicateMember } from "@/features/booking/domain/session-assignment/session-assignment";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { AccessTokenGeneratorPort } from "../../ports/access-token-generator/access-token-generator.port";
import type {
  CreateSnapshotResult,
  ProjectRepositoryPort,
  ServiceSnapshotSource,
} from "../../ports/project-repository/project-repository.port";
import { createProjectInputSchema } from "../../schemas/create-project-input/create-project-input.schema";
import type { CreateProjectInput } from "../../schemas/create-project-input/create-project-input.types";
import { toValidationFailure, validationFailureOf } from "../project-results/project-results";
import type {
  CreateProjectResult,
  ProjectFieldErrorKey,
} from "../project-results/project-results.types";

/** Reads the pieces the cross-checks need even when other fields are invalid, so every problem is reported at once. */
function readPartialInput(input: unknown) {
  const raw = z.record(z.string(), z.unknown()).safeParse(input).data ?? {};
  const shape = createProjectInputSchema.shape;
  return {
    mode: shape.mode.safeParse(raw.mode).data,
    serviceId: shape.serviceId.safeParse(raw.serviceId).data,
    items: shape.items.safeParse(raw.items).data ?? [],
    sessions: shape.sessions.safeParse(raw.sessions).data,
    fieldValues: shape.fieldValues.safeParse(raw.fieldValues).data ?? {},
  };
}

async function loadService(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  serviceId: string | undefined,
): Promise<ServiceSnapshotSource | null> {
  if (serviceId === undefined) return null;
  const service = await repository.findServiceForSnapshot(context, serviceId);
  if (service === null) throw new ProjectError("NOT_FOUND");
  return service;
}

async function checkItems(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  items: ReturnType<typeof readPartialInput>["items"],
) {
  const found = await repository.findDefinitionRules(
    context,
    items.map((item) => item.definitionId),
  );
  const rules = Object.fromEntries(found.map((rule) => [rule.id, rule]));
  return validateItemList(items, rules);
}

function indexOfDefinition(input: CreateProjectInput, definitionId: string, last: boolean): string {
  const ids = input.items.map((item) => item.definitionId);
  const index = last ? ids.lastIndexOf(definitionId) : ids.indexOf(definitionId);
  return `items.${String(index)}.definitionId`;
}

function snapshotFailure(
  result: Exclude<CreateSnapshotResult, { status: "CREATED" }>,
  input: CreateProjectInput,
): CreateProjectResult {
  switch (result.status) {
    case "NOT_FOUND":
      throw new ProjectError("NOT_FOUND");
    case "CLIENT_INACTIVE":
      return validationFailureOf({ clientId: "CLIENT_INACTIVE" });
    case "SERVICE_INACTIVE":
      return validationFailureOf({ serviceId: "SERVICE_INACTIVE" });
    case "TEAM_INVALID":
      return validationFailureOf({
        [`sessions.${String(result.sessionIndex)}.team`]: "TEAM_INVALID",
      });
    case "DEFINITION_INACTIVE":
      return validationFailureOf({
        [indexOfDefinition(input, result.definitionId, false)]: "DEFINITION_INACTIVE",
      });
    case "DUPLICATE_DEFINITION":
      return validationFailureOf({
        [indexOfDefinition(input, result.definitionId, true)]: "DUPLICATE_DEFINITION",
      });
  }
}

/** AC-TEAM-028: a member picked twice for one session is refused before anything is written. */
function duplicateTeamErrors(input: CreateProjectInput): Record<string, ProjectFieldErrorKey> {
  return Object.fromEntries(
    input.sessions.flatMap((session, index) =>
      hasDuplicateMember(session.team) ? [[`sessions.${String(index)}.team`, "TEAM_INVALID"]] : [],
    ),
  );
}

/** Creates a project as a DRAFT or BOOKED snapshot of a service, reporting every validation problem at once (BR-PRJ-001, BR-PRJ-002, BR-PRJ-008). @param repository - project port @param generateToken - client access token generator @param context - verified workspace @param actorId - the Owner creating it @param input - untrusted form values @returns the new project id or the field errors */
export async function createProject(
  repository: ProjectRepositoryPort,
  generateToken: AccessTokenGeneratorPort,
  context: WorkspaceContext,
  actorId: string,
  input: unknown,
): Promise<CreateProjectResult> {
  const parsed = createProjectInputSchema.safeParse(input);
  const errors: Record<string, ProjectFieldErrorKey> = parsed.success
    ? {}
    : { ...toValidationFailure(parsed.error.issues).fieldErrors };
  const partial = readPartialInput(input);
  const service = await loadService(repository, context, partial.serviceId);
  if (service && !service.isActive) errors.serviceId = "SERVICE_INACTIVE";
  const fieldCheck = validateFieldValues(service?.fields ?? [], partial.fieldValues);
  for (const [key, problem] of Object.entries(fieldCheck.problems)) {
    errors[`fieldValues.${key}`] = problem;
  }
  const itemCheck = await checkItems(repository, context, partial.items);
  Object.assign(errors, itemCheck.errors);
  if (partial.mode === "BOOKED" && partial.sessions?.length === 0)
    errors.sessions = "SESSION_REQUIRED";
  if (parsed.success) Object.assign(errors, duplicateTeamErrors(parsed.data));
  if (!parsed.success || Object.keys(errors).length > 0) return validationFailureOf(errors);
  const result = await repository.createSnapshot(context, {
    status: parsed.data.mode,
    clientId: parsed.data.clientId,
    serviceId: parsed.data.serviceId,
    title: parsed.data.title,
    notes: parsed.data.notes,
    agreedPrice: parsed.data.agreedPrice,
    accessToken: generateToken(),
    actorId,
    items: parsed.data.items.flatMap((item, index) => {
      const value = itemCheck.values[index];
      return value ? [{ definitionId: item.definitionId, value }] : [];
    }),
    fieldValues: fieldCheck.values,
    sessions: parsed.data.sessions,
  });
  return result.status === "CREATED"
    ? { ok: true, projectId: result.id }
    : snapshotFailure(result, parsed.data);
}
