"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { PROJECT_EDIT_COPY_NAMESPACE } from "./project-edit.copy";
import type { SubmitErrors } from "./project-edit.types";

/** Runs a detail edit and turns its outcome into a toast and a refresh; field errors go back to the dialog (AC-PRJ-017…019, 029). @returns `run(call)` */
export function useProjectEdits() {
  const t = useTranslations(PROJECT_EDIT_COPY_NAMESPACE);
  const router = useRouter();
  const run = async (call: () => Promise<ProjectWriteResult>): Promise<SubmitErrors> => {
    try {
      const result = await call();
      if (result === undefined) {
        showToast({ tone: "success", title: t("editSavedToast") });
        router.refresh();
        return null;
      }
      if (result.code === "VALIDATION_FAILED") return result.fieldErrors;
      showFailure(t, result);
      router.refresh();
      return null;
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        body: t("serverErrorBody"),
      });
      return {};
    }
  };
  return { run };
}

function showFailure(t: ProjectTranslate, result: Exclude<ProjectWriteResult, undefined>): void {
  const { code } = result;
  if (result.code === "SELECTION_IN_USE") {
    const usage = [String(result.usage), result.unit].filter(Boolean).join(" ");
    showToast({
      tone: "danger",
      title: t("selectionInUseTitle"),
      body: t("selectionInUseBody", { usage }),
    });
  } else if (code === "SELECTION_CLOSED") {
    showToast({
      tone: "danger",
      title: t("selectionClosedTitle"),
      body: t("selectionClosedBody"),
    });
  } else if (code === "SELECTION_HAS_ADD_ON") {
    showToast({
      tone: "danger",
      title: t("selectionHasAddOnTitle"),
      body: t("selectionHasAddOnBody"),
    });
  } else if (code === "LAST_SESSION") {
    showToast({ tone: "danger", title: t("lastSessionToast") });
  } else if (code === "DEAL_LOCKED") {
    showToast({
      tone: "danger",
      title: t("dealLockedTitle"),
      body: t("dealLockedBody"),
    });
  } else if (code === "PROJECT_CANCELLED") {
    showToast({ tone: "danger", title: t("infoCancelledTitle") });
  } else {
    showToast({
      tone: "danger",
      title: t("toastStaleTitle"),
      body: t("toastStaleBody"),
    });
  }
}
