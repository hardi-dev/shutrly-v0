"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ManualStep } from "@/features/booking/domain/project-status/project-status.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { projectStepCopy } from "../project-step-copy/project-step-copy";
import { USE_PROJECT_ACTIONS_COPY_NAMESPACE } from "./use-project-actions.copy";
import type { UseProjectActionsInput } from "./use-project-actions.types";

/**
 * Runs the status steps from the detail page and reports each outcome as a toast (AC-PRJ-009, 020, 021).
 * @param input - workspace, project and the step action
 * @returns the pending step and `advance`
 */
export function useProjectActions(input: Readonly<UseProjectActionsInput>) {
  const t = useTranslations(USE_PROJECT_ACTIONS_COPY_NAMESPACE);
  const router = useRouter();
  const [pendingStep, setPendingStep] = useState<ManualStep | null>(null);
  const advance = async (step: ManualStep, projectId = input.projectId): Promise<void> => {
    setPendingStep(step);
    try {
      const result = await input.advanceAction(input.workspaceId, projectId, step);
      if (result === undefined) {
        const copy = projectStepCopy(t, step);
        showToast({ tone: "success", title: copy.toastTitle, body: copy.toastBody });
        router.refresh();
      } else if (result.code === "STALE") {
        showToast({
          tone: "danger",
          title: t("toastStaleTitle"),
          body: t("toastStaleBody"),
        });
        router.refresh();
      } else if (result.code === "SESSION_REQUIRED") {
        showToast({ tone: "danger", title: t("toastSessionRequiredTitle") });
        input.onSessionRequired?.();
      } else {
        showFailure(t, step, projectId, advance);
      }
    } catch {
      showFailure(t, step, projectId, advance);
    } finally {
      setPendingStep(null);
    }
  };
  return { pendingStep, advance };
}

function showFailure(
  t: ProjectTranslate,
  step: ManualStep,
  projectId: string,
  retry: (step: ManualStep, projectId: string) => Promise<void>,
): void {
  showToast({
    tone: "danger",
    title: t("serverErrorTitle"),
    body: t("serverErrorBody"),
    action: {
      label: t("retry"),
      onAction: () => {
        void retry(step, projectId);
      },
    },
  });
}
