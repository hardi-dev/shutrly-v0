"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { SetPickResult } from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import { showToast } from "@/ui/patterns/toast/toast";

import {
  maxQuantityOf,
  remainingOfReview,
  usageOfReview,
  withQuantity,
  withRestored,
  withReviewNote,
} from "./review-state";
import { USE_REVIEW_NAMESPACE } from "./use-review-screen.copy";
import type { ReviewChangesHandle, UseReviewInput } from "./use-review-screen.types";

type Outcome = SetPickResult | "SIGNED_OUT" | "FAILED";

type ReviewTranslate = ReturnType<typeof useTranslations>;

function refusal(
  t: ReviewTranslate,
  outcome: Outcome,
): { title: string; tone: "warning" | "danger" } | null {
  if (outcome === "FAILED") return { title: t("failed"), tone: "danger" };
  if (outcome === "SIGNED_OUT" || outcome.ok) return null;
  if (outcome.code === "LIMIT_REACHED") return { title: t("limitReached"), tone: "warning" };
  if (outcome.code === "GROUP_NOT_OPEN") return { title: t("groupClosed"), tone: "warning" };
  if (outcome.code === "RATE_LIMITED") return { title: t("rateLimited"), tone: "warning" };
  return { title: t("failed"), tone: "danger" };
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
  const t = useTranslations(USE_REVIEW_NAMESPACE);
  const [state, setState] = useState({ group: view.group, picks: view.picks });
  const reload = async () => {
    const result = await actions.reload(view.group.id).catch(() => null);
    if (result === null) showToast({ tone: "danger", title: t("failed") });
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
      const problem = refusal(t, outcome);
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
