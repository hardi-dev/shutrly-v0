import type {
  FilterClientOption,
  FilterServiceOption,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { DashboardOverview } from "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview.types";

import type { SearchFilterClientsCall } from "../project-filter-dialog/project-filter-dialog.types";
import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";

export interface DashboardOverviewProps {
  readonly workspaceId: string;
  readonly overview: DashboardOverview;
  readonly services: readonly FilterServiceOption[];
  readonly filterClient: FilterClientOption | null;
  readonly menuActions: ProjectMenuActions;
  readonly searchClientsAction: SearchFilterClientsCall;
}
