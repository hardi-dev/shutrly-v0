"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { REVIEW_COPY as COPY } from "../review-screen/review-screen.copy";
import type {
  ReviewActions,
  ReviewChangesHandle,
  ReviewSubmitHandle,
} from "./use-review-screen.types";

type SubmitOutcome = Awaited<ReturnType<ReviewActions["submit"]>> | "FAILED";

/**
 * Drives *Kirim*: with places left it asks first, otherwise it sends; the server's own
 * NEEDS_CONFIRMATION opens the same notice. A sent group returns the client to Beranda with a
 * toast; a group that closed meanwhile re-renders as the read-only view (A-5, D-13, AC-SEL-008/009).
 * @param actions - the Tinjau actions
 * @param changes - the review state, for the group and the places left
 * @param token - the client access token, for the Beranda link
 * @returns the submit state and handlers
 */
export function useReviewSubmit(
  actions: ReviewActions,
  changes: ReviewChangesHandle,
  token: string,
): ReviewSubmitHandle {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmRemaining, setConfirmRemaining] = useState<number | null>(null);
  const { group } = changes.state;
  const submit = async (confirmBelowLimit: boolean) => {
    setIsSubmitting(true);
    const outcome: SubmitOutcome = await actions
      .submit({ groupId: group.id, confirmBelowLimit })
      .catch(() => "FAILED" as const);
    setIsSubmitting(false);
    if (outcome === "FAILED") showToast({ tone: "danger", title: COPY.sendFailed });
    else if ("kind" in outcome) router.refresh();
    else if (outcome.ok) {
      showToast({
        tone: "success",
        title: COPY.sentToastTitle(outcome.groupName),
        body: COPY.sentToastBody,
      });
      router.push(`/g/${token}`);
    } else if (outcome.code === "NEEDS_CONFIRMATION") setConfirmRemaining(outcome.remaining);
    else if (outcome.code === "GROUP_NOT_OPEN") router.refresh();
    else if (outcome.code === "RATE_LIMITED")
      showToast({ tone: "warning", title: COPY.rateLimited });
    else {
      showToast({ tone: "danger", title: COPY.sendFailed });
      void changes.reload();
    }
  };
  const send = () => {
    if (changes.remaining > 0) setConfirmRemaining(changes.remaining);
    else void submit(false);
  };
  const confirm = () => {
    setConfirmRemaining(null);
    void submit(true);
  };
  const closeConfirm = () => {
    setConfirmRemaining(null);
  };
  return { isSubmitting, confirmRemaining, send, confirm, closeConfirm };
}
