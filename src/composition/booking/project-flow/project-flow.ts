import "server-only";

import { notFound } from "next/navigation";

import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { projectIdSchema } from "@/features/booking/application/schemas/project-ids/project-ids.schema";
import { createProject } from "@/features/booking/application/use-cases/create-project/create-project";
import { getProjectDetail } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail";
import { loadCreateOptions } from "@/features/booking/application/use-cases/load-create-options/load-create-options";
import { searchActiveClients } from "@/features/booking/application/use-cases/search-active-clients/search-active-clients";
import { PROJECT_SEARCH_MAX_LENGTH } from "@/features/booking/domain/project-record/project-record";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withProjectScope } from "../project-scope/project-scope";
import type { CreateProjectOptions } from "./project-flow.types";

function saveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof ProjectError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError)) {
    logger.error("project.save_failed", { workspaceId, operation });
  }
  throw new ProjectError("SAVE_FAILED");
}

function idOrNotFound(rawId: string): string {
  const parsed = projectIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

export async function loadCreateProjectOptions(
  rawWorkspaceId: string,
): Promise<CreateProjectOptions> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) => loadCreateOptions(projects, verified.context));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "load-options");
  }
}

export async function createProjectEntry(rawWorkspaceId: string, values: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects, accessTokens }) =>
      createProject(projects, accessTokens, verified.context, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "create");
  }
}

export async function searchClientsEntry(rawWorkspaceId: string, query: unknown) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const text = typeof query === "string" ? query.slice(0, PROJECT_SEARCH_MAX_LENGTH) : "";
  try {
    return await withProjectScope(({ projects }) =>
      searchActiveClients(projects, verified.context, text),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "search-clients");
  }
}

export async function loadProjectDetail(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = idOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      getProjectDetail(projects, verified.context, projectId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "detail");
  }
}
