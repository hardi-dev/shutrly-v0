import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

const CHIPS: Readonly<Record<ProjectStatus, Pick<StatusChipProps, "label" | "tone" | "hasDot">>> = {
  DRAFT: { label: PROJECT_COPY.statusDraft, tone: "neutral", hasDot: true },
  BOOKED: { label: PROJECT_COPY.statusBooked, tone: "info", hasDot: true },
  SHOOTING: { label: PROJECT_COPY.statusShooting, tone: "accent", hasDot: true },
  POST_PROCESSING: { label: PROJECT_COPY.statusPostProcessing, tone: "warning", hasDot: true },
  DELIVERED: { label: PROJECT_COPY.statusDelivered, tone: "success", hasDot: true },
  COMPLETED: { label: PROJECT_COPY.statusCompleted, tone: "success", hasDot: false },
  CANCELLED: { label: PROJECT_COPY.statusCancelled, tone: "neutral", hasDot: true },
};

/** Maps a project status to its label, chip tone and dot (design-handoff decision 1). @param status - stored status @returns the chip props */
export function projectStatusChip(status: ProjectStatus) {
  return CHIPS[status];
}
