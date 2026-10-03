import type { ProjectPage } from "@/features/booking/application/use-cases/list-projects/list-projects.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

export type LoadMoreProjectsCall = (workspaceId: string, query: unknown) => Promise<ProjectPage>;

export interface UseLoadMoreProjectsProps {
  readonly workspaceId: string;
  readonly tab: ProjectTab;
  readonly q: string;
  readonly initial: ProjectPage;
  readonly action?: LoadMoreProjectsCall;
}
