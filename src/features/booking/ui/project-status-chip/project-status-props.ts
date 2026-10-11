import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import type { ProjectTranslate } from "../project-copy/project-copy.types";

const CHIPS = {
  DRAFT: { labelKey: "statusDraft", tone: "neutral", hasDot: true },
  BOOKED: { labelKey: "statusBooked", tone: "info", hasDot: true },
  SHOOTING: { labelKey: "statusShooting", tone: "accent", hasDot: true },
  POST_PROCESSING: { labelKey: "statusPostProcessing", tone: "warning", hasDot: true },
  DELIVERED: { labelKey: "statusDelivered", tone: "success", hasDot: true },
  COMPLETED: { labelKey: "statusCompleted", tone: "success", hasDot: false },
  CANCELLED: { labelKey: "statusCancelled", tone: "neutral", hasDot: true },
} as const satisfies Record<ProjectStatus, unknown>;

/**
 * Maps a project status to its label, chip tone and dot (design-handoff decision 1).
 * @param t - the project translator
 * @param status - stored status
 * @returns the chip props
 */
export function projectStatusChip(
  t: ProjectTranslate,
  status: ProjectStatus,
): Pick<StatusChipProps, "label" | "tone" | "hasDot"> {
  const chip = CHIPS[status];
  return { label: t(chip.labelKey), tone: chip.tone, hasDot: chip.hasDot };
}
