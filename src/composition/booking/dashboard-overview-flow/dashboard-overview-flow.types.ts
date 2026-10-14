import type {
  FilterClientOption,
  FilterServiceOption,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { DashboardOverview } from "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview.types";

export interface DashboardOverviewData {
  readonly overview: DashboardOverview;
  /** The services for the filter dialog. */
  readonly services: readonly FilterServiceOption[];
  /** The client chosen in the filter, so the dialog can show its name; null when none. */
  readonly filterClient: FilterClientOption | null;
}
