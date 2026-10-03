import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { ProjectStepCopy } from "./project-step-copy.types";

const STEP_COPY: Readonly<Record<ProjectStep, ProjectStepCopy>> = {
  CONFIRM_BOOKING: {
    label: PROJECT_COPY.stepConfirm,
    pendingLabel: PROJECT_COPY.stepConfirmPending,
    icon: "calendar-check",
    toastTitle: PROJECT_COPY.toastConfirmedTitle,
  },
  START_SHOOTING: {
    label: PROJECT_COPY.stepStart,
    pendingLabel: PROJECT_COPY.stepStartPending,
    icon: "camera",
    toastTitle: PROJECT_COPY.toastStartedTitle,
    toastBody: PROJECT_COPY.toastStartedBody,
  },
  FINISH_SHOOTING: {
    label: PROJECT_COPY.stepFinish,
    pendingLabel: PROJECT_COPY.stepFinishPending,
    icon: "circle-check-big",
    toastTitle: PROJECT_COPY.toastFinishedTitle,
  },
};

/** Looks up a step's button label, pending label, icon and success toast. @param step - the step @returns its copy */
export function projectStepCopy(step: ProjectStep): ProjectStepCopy {
  return STEP_COPY[step];
}
