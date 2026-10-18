"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { MARK_DELIVERED_BUTTON_COPY_NAMESPACE } from "./mark-delivered-button.copy";
import type { UseMarkDeliveredInput } from "./mark-delivered-button.types";

/** The flow of *Tandai terkirim*: the confirm, the write, and its toast (AC-GFL-017). A refusal names the missing finished file. @param input - ids, the server action and the card @returns the dialog state and its handlers */
export function useMarkDelivered(input: Readonly<UseMarkDeliveredInput>) {
  const t = useTranslations(MARK_DELIVERED_BUTTON_COPY_NAMESPACE);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { workspaceId, projectId, actions } = input;
  async function write(): Promise<void> {
    setIsPending(true);
    try {
      const result = await actions.markDeliveredAction(workspaceId, projectId);
      setIsOpen(false);
      input.onDone?.();
      if (result) {
        showToast({
          tone: "danger",
          title: t("refusedCompleteTitle"),
          body: t("reasonNoFinishedFile"),
        });
      } else {
        showToast({ tone: "success", title: t("completedToast") });
      }
    } catch {
      showToast({ tone: "danger", title: t("failedToast") });
    } finally {
      setIsPending(false);
    }
  }
  return {
    isOpen,
    isPending,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
    confirm: () => {
      void write();
    },
  };
}
