import "server-only";

import { notFound } from "next/navigation";

import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { projectIdSchema } from "@/features/booking/application/schemas/project-ids/project-ids.schema";
import { projectListQuerySchema } from "@/features/booking/application/schemas/project-list-query/project-list-query.schema";
import { advanceProject } from "@/features/booking/application/use-cases/advance-project/advance-project";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";
import { countProjects } from "@/features/booking/application/use-cases/count-projects/count-projects";
import { createProject } from "@/features/booking/application/use-cases/create-project/create-project";
import { deleteDraft } from "@/features/booking/application/use-cases/delete-draft/delete-draft";
import {
  addProjectSession,
  deleteProjectSession,
  updateProjectFieldValues,
  updateProjectSession,
} from "@/features/booking/application/use-cases/edit-project/project-field-and-session-edits";
import { getProjectDetail } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail";
import { listProjects } from "@/features/booking/application/use-cases/list-projects/list-projects";
import { loadCreateOptions } from "@/features/booking/application/use-cases/load-create-options/load-create-options";
import {
  loadFilterServices,
  searchFilterClients,
} from "@/features/booking/application/use-cases/load-filter-options/load-filter-options";
import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import { searchActiveClients } from "@/features/booking/application/use-cases/search-active-clients/search-active-clients";
import { updateProjectInfo } from "@/features/booking/application/use-cases/update-project-info/update-project-info";
import { parseProjectListParams } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectListParams } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import { PROJECT_SEARCH_MAX_LENGTH } from "@/features/booking/domain/project-record/project-record";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { todayInScheduleZone } from "@/features/booking/domain/schedule-clock/schedule-clock";
import { archiveGalleryOfCancelledProject } from "@/features/gallery/application/use-cases/archive-gallery-of-cancelled-project/archive-gallery-of-cancelled-project";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withProjectCancellationScope } from "../project-cancellation-scope/project-cancellation-scope";
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
      getProjectDetail(projects, verified.context, projectId, todayInScheduleZone(new Date())),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "detail");
  }
}

export async function advanceProjectEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  step: unknown,
) {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      advanceProject(projects, verified.context, account.id, projectId, step),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "advance");
  }
}

export async function loadProjects(
  rawWorkspaceId: string,
  tab: ProjectTab,
  params: ProjectListParams = {},
) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const { q, filter } = parseProjectListParams(params, tab);
  try {
    return await withProjectScope(async ({ projects, projectList }) => {
      const today = todayInScheduleZone(new Date());
      const query = { tab, q: q ?? "", afterId: null, filter };
      return {
        tab,
        q: q ?? "",
        filter,
        page: await listProjects(projectList, verified.context, query, today),
        count: await countProjects(projectList, verified.context, tab),
        services: await loadFilterServices(projects, verified.context),
        filterClient:
          filter.clientId === null
            ? null
            : await projects.findFilterClient(verified.context, filter.clientId),
      };
    });
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list");
  }
}

export async function loadProjectDefinitions(rawWorkspaceId: string) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      projects.listActiveDefinitions(verified.context),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "definitions");
  }
}

export async function searchFilterClientsEntry(rawWorkspaceId: string, query: unknown) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      searchFilterClients(projects, verified.context, query),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "filter-clients");
  }
}

export async function loadMoreProjectsEntry(rawWorkspaceId: string, rawQuery: unknown) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const parsed = projectListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) notFound();
  try {
    return await withProjectScope(({ projectList }) =>
      listProjects(projectList, verified.context, parsed.data, todayInScheduleZone(new Date())),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list");
  }
}

export async function updateProjectInfoEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  values: unknown,
) {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      updateProjectInfo(projects, verified.context, account.id, projectId, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "update-info");
  }
}

export async function cancelProjectEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  values: unknown,
) {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    // One transaction: a published gallery is archived with the cancel, or neither happens (AC-GAL-024).
    return await withProjectCancellationScope(async ({ projects, galleries, now }) => {
      const result = await cancelProject(projects, verified.context, account.id, projectId, values);
      if (result === undefined) {
        await archiveGalleryOfCancelledProject(
          { sources: galleries, now },
          verified.context,
          account.id,
          projectId,
        );
      }
      return result;
    });
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "cancel");
  }
}

export async function deleteDraftEntry(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = idOrNotFound(rawProjectId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      deleteDraft(projects, verified.context, projectId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "delete-draft");
  }
}

async function runEdit(
  rawWorkspaceId: string,
  rawProjectId: string,
  operation: string,
  work: (
    projects: ProjectRepositoryPort,
    context: WorkspaceContext,
    actorId: string,
    projectId: string,
  ) => Promise<ProjectWriteResult>,
) {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects }) =>
      work(projects, verified.context, account.id, projectId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, operation);
  }
}

export function updateProjectFieldValuesEntry(ws: string, id: string, values: unknown) {
  return runEdit(ws, id, "update-fields", (projects, context, actor, projectId) =>
    updateProjectFieldValues(projects, context, actor, projectId, values),
  );
}

export function addSessionEntry(ws: string, id: string, values: unknown) {
  return runEdit(ws, id, "add-session", (projects, context, actor, projectId) =>
    addProjectSession(projects, context, actor, projectId, values),
  );
}

export function updateSessionEntry(ws: string, id: string, sessionId: string, values: unknown) {
  return runEdit(ws, id, "update-session", (projects, context, actor, projectId) =>
    updateProjectSession(projects, context, actor, projectId, idOrNotFound(sessionId), values),
  );
}

export function deleteSessionEntry(ws: string, id: string, sessionId: string) {
  return runEdit(ws, id, "delete-session", (projects, context, _actor, projectId) =>
    deleteProjectSession(projects, context, projectId, idOrNotFound(sessionId)),
  );
}
