import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

const SUFFIX: Readonly<Record<ProjectTab, string>> = {
  ACTIVE: "",
  COMPLETED: "/completed",
  CANCELLED: "/cancelled",
};

/** The list route of a tab. @param workspaceId - the workspace @param tab - the tab @returns the path without a query */
export function projectTabPath(workspaceId: string, tab: ProjectTab): string {
  return `/w/${workspaceId}/projects${SUFFIX[tab]}`;
}
