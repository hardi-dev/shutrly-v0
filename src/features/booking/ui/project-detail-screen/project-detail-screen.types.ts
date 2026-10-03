import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";

import type { AdvanceProjectCall } from "../use-project-actions/use-project-actions.types";

export interface ProjectDetailScreenProps {
  readonly workspaceId: string;
  readonly project: ProjectDetailView;
  readonly advanceAction: AdvanceProjectCall;
}

export interface ProjectDetailCardProps {
  readonly project: ProjectDetailView;
  readonly isMobile: boolean;
}
