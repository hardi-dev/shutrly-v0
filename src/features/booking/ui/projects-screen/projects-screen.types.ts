import type {
  FilterClientOption,
  FilterServiceOption,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { ProjectPage } from "@/features/booking/application/use-cases/list-projects/list-projects.types";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

import type { SearchFilterClientsCall } from "../project-filter-dialog/project-filter-dialog.types";
import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";
import type { LoadMoreProjectsCall } from "../use-load-more-projects/use-load-more-projects.types";

export interface ProjectsScreenProps {
  readonly workspaceId: string;
  readonly tab: ProjectTab;
  readonly count: number;
  readonly q: string;
  readonly filter: ProjectFilter;
  readonly services: readonly FilterServiceOption[];
  readonly filterClient: FilterClientOption | null;
  readonly searchClientsAction: SearchFilterClientsCall;
  readonly menuActions: ProjectMenuActions;
  readonly initialPage: ProjectPage;
  readonly loadMoreAction: LoadMoreProjectsCall;
}
