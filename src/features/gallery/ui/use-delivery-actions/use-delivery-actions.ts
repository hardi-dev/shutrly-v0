"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type {
  DeliveryCardProps,
  DeliveryDialogState,
  DeliveryFlows,
} from "../delivery-card/delivery-card.types";
import type { DeliveryTranslate } from "../delivery-copy/delivery-copy.types";
import { USE_DELIVERY_ACTIONS_COPY_NAMESPACE } from "./use-delivery-actions.copy";

async function run(
  t: DeliveryTranslate,
  props: Readonly<DeliveryCardProps>,
  kind: "PUBLISH" | "COMPLETE",
): Promise<DeliveryDialogState | null> {
  const { workspaceId, projectId, actions } = props;
  if (kind === "PUBLISH") {
    const result = await actions.publishAction(workspaceId, projectId);
    if (result) return { kind: "REFUSED", reasons: result.reasons };
    showToast({ tone: "success", title: t("publishedToast") });
    return null;
  }
  const result = await actions.completeAction(workspaceId, projectId);
  showToast(
    result
      ? { tone: "danger", title: t("staleToast") }
      : { tone: "success", title: t("completedToast") },
  );
  return null;
}

/**
 * The *Hasil akhir* card's flows: the publish and completion confirms, the write, its toast, and the
 * refusal dialog with every reason (AC-DEL-001, -002, -007).
 * @param props - the card props with the server actions
 * @returns the dialog state and handlers
 */
export function useDeliveryActions(props: Readonly<DeliveryCardProps>): DeliveryFlows {
  const t = useTranslations(USE_DELIVERY_ACTIONS_COPY_NAMESPACE);
  const [dialog, setDialog] = useState<DeliveryDialogState | null>(null);
  const [isPending, setIsPending] = useState(false);
  async function write(kind: "PUBLISH" | "COMPLETE"): Promise<void> {
    setIsPending(true);
    try {
      setDialog(await run(t, props, kind));
    } catch {
      setDialog(null);
      showToast({ tone: "danger", title: t("failedToast") });
    } finally {
      setIsPending(false);
    }
  }
  return {
    dialog,
    isPending,
    startPublish: () => {
      if (props.card.state === "READY") setDialog({ kind: "PUBLISH" });
      else void write("PUBLISH");
    },
    startComplete: () => {
      setDialog({ kind: "COMPLETE" });
    },
    confirm: () => {
      if (dialog?.kind === "PUBLISH" || dialog?.kind === "COMPLETE") void write(dialog.kind);
      else setDialog(null);
    },
    close: () => {
      setDialog(null);
    },
  };
}
