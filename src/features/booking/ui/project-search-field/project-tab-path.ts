import { filterToParams } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

const SUFFIX: Readonly<Record<ProjectTab, string>> = {
  ACTIVE: "",
  COMPLETED: "/completed",
  CANCELLED: "/cancelled",
};

/** The list URL of a tab with the search and filter params (A-11); empty parts are left out. @param workspaceId - the workspace @param tab - the tab @param q - the search text @param filter - the filter @returns the path with its query string */
export function projectListUrl(
  workspaceId: string,
  tab: ProjectTab,
  q: string,
  filter: ProjectFilter,
): string {
  const params = new URLSearchParams();
  if (q !== "") params.set("q", q);
  for (const [key, value] of filterToParams(filter)) params.set(key, value);
  const query = params.toString();
  const path = projectTabPath(workspaceId, tab);
  return query === "" ? path : path + "?" + query;
}

/** The list route of a tab. @param workspaceId - the workspace @param tab - the tab @returns the path without a query */
export function projectTabPath(workspaceId: string, tab: ProjectTab): string {
  return `/w/${workspaceId}/projects${SUFFIX[tab]}`;
}
