"use client";

import { useState } from "react";

import type { AddOnWriteResult } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type {
  AddOnCardProps,
  AddOnConfirmState,
  AddOnFlows,
} from "../add-on-card/add-on-card.types";
import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";

function failureTitle(result: Exclude<AddOnWriteResult, undefined>): string {
  if (result.code === "TARGET_LOCKED") return COPY.targetLockedTitle;
  if (result.code === "ADD_ON_STATUS") return COPY.addOnStatusTitle;
  return COPY.failedTitle;
}

async function deleteDraft(props: Readonly<AddOnCardProps>, row: AddOnRowView): Promise<void> {
  const { workspaceId, projectId, actions } = props;
  try {
    const result = await actions.deleteDraftAction(workspaceId, projectId, { addOnId: row.id });
    if (result) showToast({ tone: "danger", title: failureTitle(result) });
    else showToast({ tone: "success", title: COPY.deletedTitle });
  } catch {
    showToast({ tone: "danger", title: COPY.failedTitle });
  }
}

/**
 * The add-on card's approve, cancel and delete flows: which confirm is open, the pending flag, the
 * write, and its toast; a cancel below usage turns into the refusal dialog (AC-ADD-001, -005).
 * @param props - the card props with the server actions
 * @returns the confirm state and the handlers
 */
export function useAddOnActions(props: Readonly<AddOnCardProps>): AddOnFlows {
  const { workspaceId, projectId, actions } = props;
  const [confirm, setConfirm] = useState<AddOnConfirmState | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function write(state: AddOnConfirmState): Promise<void> {
    const action = state.kind === "APPROVE" ? actions.approveAction : actions.cancelAction;
    setIsPending(true);
    try {
      const result = await action(workspaceId, projectId, { addOnId: state.row.id });
      if (result?.code === "CANCEL_BELOW_USAGE") {
        setConfirm({ kind: "REFUSED", row: state.row, usage: result.usage, limit: result.limit });
        return;
      }
      setConfirm(null);
      if (result) showToast({ tone: "danger", title: failureTitle(result) });
      else {
        const title = state.kind === "APPROVE" ? COPY.approvedTitle : COPY.cancelledTitle;
        showToast({ tone: "success", title });
      }
    } catch {
      showToast({ tone: "danger", title: COPY.failedTitle });
    } finally {
      setIsPending(false);
    }
  }

  return {
    confirm,
    isPending,
    open: (state: AddOnConfirmState) => {
      setConfirm(state);
    },
    close: () => {
      setConfirm(null);
    },
    confirmCurrent: () => {
      if (!confirm || confirm.kind === "REFUSED") setConfirm(null);
      else void write(confirm);
    },
    deleteDraft: (row: AddOnRowView) => {
      void deleteDraft(props, row);
    },
  };
}
