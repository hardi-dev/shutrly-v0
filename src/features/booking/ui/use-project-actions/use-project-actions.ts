"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectStepCopy } from "../project-step-copy/project-step-copy";
import type { UseProjectActionsInput } from "./use-project-actions.types";

/** Runs the status steps from the detail page and reports each outcome as a toast (AC-PRJ-009, 020, 021). @param input - workspace, project and the step action @returns the pending step and `advance` */
export function useProjectActions(input: Readonly<UseProjectActionsInput>) {
  const router = useRouter();
  const [pendingStep, setPendingStep] = useState<ProjectStep | null>(null);
  const advance = async (step: ProjectStep): Promise<void> => {
    setPendingStep(step);
    try {
      const result = await input.advanceAction(input.workspaceId, input.projectId, step);
      if (result === undefined) {
        const copy = projectStepCopy(step);
        showToast({ tone: "success", title: copy.toastTitle, body: copy.toastBody });
        router.refresh();
      } else if (result.code === "STALE") {
        showToast({
          tone: "danger",
          title: PROJECT_COPY.toastStaleTitle,
          body: PROJECT_COPY.toastStaleBody,
        });
        router.refresh();
      } else if (result.code === "SESSION_REQUIRED") {
        showToast({ tone: "danger", title: PROJECT_COPY.toastSessionRequiredTitle });
      } else {
        showFailure(step, advance);
      }
    } catch {
      showFailure(step, advance);
    } finally {
      setPendingStep(null);
    }
  };
  return { pendingStep, advance };
}

function showFailure(step: ProjectStep, retry: (step: ProjectStep) => Promise<void>): void {
  showToast({
    tone: "danger",
    title: PROJECT_COPY.serverErrorTitle,
    body: PROJECT_COPY.serverErrorBody,
    action: {
      label: PROJECT_COPY.retry,
      onAction: () => {
        void retry(step);
      },
    },
  });
}
