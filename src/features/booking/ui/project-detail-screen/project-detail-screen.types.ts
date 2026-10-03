import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";

import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";

export interface ProjectDetailScreenProps {
  readonly workspaceId: string;
  readonly project: ProjectDetailView;
  readonly menuActions: ProjectMenuActions;
}

export interface ProjectDetailCardProps {
  readonly project: ProjectDetailView;
  readonly isMobile: boolean;
}
