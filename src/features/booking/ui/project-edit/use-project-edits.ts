"use client";

import { useRouter } from "next/navigation";

import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SubmitErrors } from "./project-edit.types";

/** Runs a detail edit and turns its outcome into a toast and a refresh; field errors go back to the dialog (AC-PRJ-017…019, 029). @returns `run(call)` */
export function useProjectEdits() {
  const router = useRouter();
  const run = async (call: () => Promise<ProjectWriteResult>): Promise<SubmitErrors> => {
    try {
      const result = await call();
      if (result === undefined) {
        showToast({ tone: "success", title: PROJECT_COPY.editSavedToast });
        router.refresh();
        return null;
      }
      if (result.code === "VALIDATION_FAILED") return result.fieldErrors;
      showFailure(result);
      router.refresh();
      return null;
    } catch {
      showToast({
        tone: "danger",
        title: PROJECT_COPY.serverErrorTitle,
        body: PROJECT_COPY.serverErrorBody,
      });
      return {};
    }
  };
  return { run };
}

function showFailure(result: Exclude<ProjectWriteResult, undefined>): void {
  const { code } = result;
  if (result.code === "SELECTION_IN_USE") {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.selectionInUseTitle,
      body: PROJECT_COPY.selectionInUseBody(result.usage, result.unit),
    });
  } else if (code === "SELECTION_CLOSED") {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.selectionClosedTitle,
      body: PROJECT_COPY.selectionClosedBody,
    });
  } else if (code === "SELECTION_HAS_ADD_ON") {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.selectionHasAddOnTitle,
      body: PROJECT_COPY.selectionHasAddOnBody,
    });
  } else if (code === "LAST_SESSION") {
    showToast({ tone: "danger", title: PROJECT_COPY.lastSessionToast });
  } else if (code === "DEAL_LOCKED") {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.dealLockedTitle,
      body: PROJECT_COPY.dealLockedBody,
    });
  } else if (code === "PROJECT_CANCELLED") {
    showToast({ tone: "danger", title: PROJECT_COPY.infoCancelledTitle });
  } else {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.toastStaleTitle,
      body: PROJECT_COPY.toastStaleBody,
    });
  }
}
