"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { FINISH_PROJECT_BUTTON_COPY_NAMESPACE } from "./finish-project-button.copy";
import type { FinishProjectButtonProps } from "./finish-project-button.types";

/**
 * The *Tandai selesai* confirm state and write (BR-PRJ-004): opens the confirm, runs the server action and
 * toasts the outcome.
 * @param props - ids, the project title and the server action
 * @returns the open and pending flags and the handlers
 */
export function useFinishProject(props: Readonly<FinishProjectButtonProps>) {
  const t = useTranslations(FINISH_PROJECT_BUTTON_COPY_NAMESPACE);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  async function finish(): Promise<void> {
    setIsPending(true);
    try {
      const result = await props.actions.completeAction(props.workspaceId, props.projectId);
      setIsOpen(false);
      showToast(
        result
          ? { tone: "danger", title: t("finishStaleToast") }
          : { tone: "success", title: t("finishedToast") },
      );
    } catch {
      showToast({ tone: "danger", title: t("failedToast") });
    } finally {
      setIsPending(false);
    }
  }
  const open = () => {
    setIsOpen(true);
  };
  const confirm = () => {
    void finish();
  };
  const onOpenChange = (next: boolean) => {
    if (!next) setIsOpen(false);
  };
  return { isOpen, isPending, open, confirm, onOpenChange };
}
