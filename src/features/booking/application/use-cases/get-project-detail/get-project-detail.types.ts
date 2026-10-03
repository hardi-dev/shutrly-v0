import type { ProjectMenuGroups } from "@/features/booking/domain/project-menu/project-menu.types";
import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";
import type { ShownSession } from "@/features/booking/domain/session/session.types";

import type { ProjectDetailRecord } from "../../ports/project-repository/project-repository.port";

export interface ProjectDetailView extends ProjectDetailRecord {
  /** The session shown in the header: the next one from today, else the last (A-12). */
  readonly shownSession: ShownSession | null;
  readonly nextStep: ProjectStep | null;
  readonly canEditDeal: boolean;
  readonly canEditSchedule: boolean;
  readonly canEditInfo: boolean;
  readonly menu: ProjectMenuGroups;
}
