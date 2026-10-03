import type { ReactNode } from "react";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

export interface ProjectsTableProps {
  readonly workspaceId: string;
  readonly tab: ProjectTab;
  readonly count: number;
  readonly rows: readonly ProjectListRow[];
  readonly emptyState: ReactNode;
  readonly search: ReactNode;
}
