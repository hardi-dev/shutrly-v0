import "server-only";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ProjectListReaderPort } from "../../ports/project-list-reader/project-list-reader.port";

/** Counts a tab's projects, ignoring any search (AC-PRJ-003). @param reader - list reader @param context - verified workspace @param tab - the tab @returns the tab total */
export function countProjects(
  reader: ProjectListReaderPort,
  context: WorkspaceContext,
  tab: ProjectTab,
): Promise<number> {
  return reader.count(context, tab);
}
