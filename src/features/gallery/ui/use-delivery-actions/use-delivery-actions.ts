"use client";

import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type {
  DeliveryCardProps,
  DeliveryDialogState,
  DeliveryFlows,
} from "../delivery-card/delivery-card.types";
import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";

async function run(
  props: Readonly<DeliveryCardProps>,
  kind: "PUBLISH" | "COMPLETE",
): Promise<DeliveryDialogState | null> {
  const { workspaceId, projectId, actions } = props;
  if (kind === "PUBLISH") {
    const result = await actions.publishAction(workspaceId, projectId);
    if (result) return { kind: "REFUSED", reasons: result.reasons };
    showToast({ tone: "success", title: COPY.publishedToast });
    return null;
  }
  const result = await actions.completeAction(workspaceId, projectId);
  showToast(
    result
      ? { tone: "danger", title: COPY.staleToast }
      : { tone: "success", title: COPY.completedToast },
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
  const [dialog, setDialog] = useState<DeliveryDialogState | null>(null);
  const [isPending, setIsPending] = useState(false);
  async function write(kind: "PUBLISH" | "COMPLETE"): Promise<void> {
    setIsPending(true);
    try {
      setDialog(await run(props, kind));
    } catch {
      setDialog(null);
      showToast({ tone: "danger", title: COPY.failedToast });
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
