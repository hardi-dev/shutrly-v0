import type { ReactNode } from "react";

import type { ActiveProjectRow } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";

export interface DashboardProjectsTableProps {
  readonly workspaceId: string;
  readonly rows: readonly ActiveProjectRow[];
  readonly total: number;
  readonly q: string;
  readonly filter: ProjectFilter;
  readonly today: string;
  /** True when a search or a filter is applied; it decides between the no-match and no-active states. */
  readonly hasQuery: boolean;
  readonly onOpenFilter: () => void;
  readonly renderMenu: (row: ActiveProjectRow) => ReactNode;
}
