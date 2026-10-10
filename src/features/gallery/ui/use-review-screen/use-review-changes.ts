"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SetPickResult } from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { REVIEW_COPY as COPY } from "../review-screen/review-screen.copy";
import {
  maxQuantityOf,
  remainingOfReview,
  usageOfReview,
  withQuantity,
  withRestored,
  withReviewNote,
} from "./review-state";
import type { ReviewChangesHandle, UseReviewInput } from "./use-review-screen.types";

type Outcome = SetPickResult | "SIGNED_OUT" | "FAILED";

function refusal(outcome: Outcome): { title: string; tone: "warning" | "danger" } | null {
  if (outcome === "FAILED") return { title: COPY.failed, tone: "danger" };
  if (outcome === "SIGNED_OUT" || outcome.ok) return null;
  if (outcome.code === "LIMIT_REACHED") return { title: COPY.limitReached, tone: "warning" };
  if (outcome.code === "GROUP_NOT_OPEN") return { title: COPY.groupClosed, tone: "warning" };
  if (outcome.code === "RATE_LIMITED") return { title: COPY.rateLimited, tone: "warning" };
  return { title: COPY.failed, tone: "danger" };
}

/**
 * Drives Tinjau's picks: a print quantity from the stepper or a removal is counted at once, saved
 * through the pick action, and undone with a re-read of the group when the server refuses (A-29,
 * D-12, AC-SEL-018).
 * @param input - the server view, the token and the actions
 * @returns the review state and handlers
 */
export function useReviewChanges({ view, actions }: UseReviewInput): ReviewChangesHandle {
  const router = useRouter();
  const [state, setState] = useState({ group: view.group, picks: view.picks });
  const reload = async () => {
    const result = await actions.reload(view.group.id).catch(() => null);
    if (result === null) showToast({ tone: "danger", title: COPY.failed });
    else if ("kind" in result && result.kind === "VIEW") {
      setState({ group: result.view.group, picks: result.view.picks });
      if (!result.view.isEditable) router.refresh();
    } else router.refresh();
  };
  const changeQuantity = (photoId: string, quantity: number) => {
    const index = state.picks.findIndex((pick) => pick.photo.id === photoId);
    const previous = state.picks[index];
    setState((current) => withQuantity(current, photoId, quantity));
    const finish = async (outcome: Outcome) => {
      if (outcome === "SIGNED_OUT") {
        router.refresh();
        return;
      }
      const problem = refusal(outcome);
      if (problem === null) return;
      setState((current) => withRestored(current, previous, index));
      showToast(problem);
      await reload();
    };
    const send = actions
      .setPick({ groupId: view.group.id, photoId, quantity })
      .then((result): Outcome => ("kind" in result ? "SIGNED_OUT" : result))
      .catch((): Outcome => "FAILED");
    void send.then(finish);
  };
  const applyNote = (photoId: string, note: string | null) => {
    setState((current) => withReviewNote(current, photoId, note));
  };
  return {
    state,
    usage: usageOfReview(state),
    remaining: remainingOfReview(state),
    maxQuantityOf: (pick) => maxQuantityOf(state, pick),
    changeQuantity,
    applyNote,
    reload,
  };
}
