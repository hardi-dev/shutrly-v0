import type { ProjectPage } from "@/features/booking/application/use-cases/list-projects/list-projects.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

import type { LoadMoreProjectsCall } from "../use-load-more-projects/use-load-more-projects.types";

export interface ProjectsScreenProps {
  readonly workspaceId: string;
  readonly tab: ProjectTab;
  readonly count: number;
  readonly q: string;
  readonly initialPage: ProjectPage;
  readonly loadMoreAction: LoadMoreProjectsCall;
}
