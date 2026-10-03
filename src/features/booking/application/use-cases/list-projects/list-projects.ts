import "server-only";

import { PROJECT_PAGE_SIZE } from "@/features/booking/domain/project-list-query/project-list-query";
import { projectSearchSchema } from "@/features/booking/domain/project-list-query/project-list-query.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ProjectListReaderPort } from "../../ports/project-list-reader/project-list-reader.port";
import type { ProjectListQuery } from "../../schemas/project-list-query/project-list-query.types";
import type { ProjectPage } from "./list-projects.types";

/** Lists one keyset page of a tab: it reads one row more than the page to know whether another page follows (AC-PRJ-005). @param reader - list reader @param context - verified workspace @param query - tab, search and cursor @param today - YYYY-MM-DD in the schedule zone @returns up to 30 rows and the next cursor */
export async function listProjects(
  reader: ProjectListReaderPort,
  context: WorkspaceContext,
  query: ProjectListQuery,
  today: string,
): Promise<ProjectPage> {
  const rows = await reader.listPage(context, {
    tab: query.tab,
    search: projectSearchSchema.safeParse(query.q).data ?? null,
    afterId: query.afterId,
    limit: PROJECT_PAGE_SIZE + 1,
    today,
  });
  return {
    items: rows.slice(0, PROJECT_PAGE_SIZE),
    nextCursor:
      rows.length > PROJECT_PAGE_SIZE ? (rows.at(PROJECT_PAGE_SIZE - 1)?.id ?? null) : null,
  };
}
