import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import type { ProjectStepCopy } from "./project-step-copy.types";

const STEP_MESSAGE_KEY = {
  CONFIRM_BOOKING: {
    label: "stepConfirm",
    pendingLabel: "stepConfirmPending",
    icon: "calendar-check",
    toastTitle: "toastConfirmedTitle",
  },
  START_SHOOTING: {
    label: "stepStart",
    pendingLabel: "stepStartPending",
    icon: "camera",
    toastTitle: "toastStartedTitle",
    toastBody: "toastStartedBody",
  },
  FINISH_SHOOTING: {
    label: "stepFinish",
    pendingLabel: "stepFinishPending",
    icon: "circle-check-big",
    toastTitle: "toastFinishedTitle",
  },
} as const;

/**
 * Looks up a step's button label, pending label, icon and success toast.
 * @param t - the project translator
 * @param step - the step
 * @returns its copy
 */
export function projectStepCopy(t: ProjectTranslate, step: ProjectStep): ProjectStepCopy {
  const keys = STEP_MESSAGE_KEY[step];
  return {
    label: t(keys.label),
    pendingLabel: t(keys.pendingLabel),
    icon: keys.icon,
    toastTitle: t(keys.toastTitle),
    toastBody: "toastBody" in keys ? t(keys.toastBody) : undefined,
  };
}
