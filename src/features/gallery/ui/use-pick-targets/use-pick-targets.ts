"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import type { SetPickResult } from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { VIEWER_PICK_COPY as COPY } from "../viewer-pick-actions/viewer-pick-actions.copy";
import { targetsOfPhoto, withStoredPick, withTargetNote } from "./pick-targets-state";
import type { PickTargetsHandle, ViewerPickActions } from "./use-pick-targets.types";

function refusalToast(result: SetPickResult) {
  if (result.ok) return;
  if (result.code === "LIMIT_REACHED") showToast({ tone: "warning", title: COPY.limitReached });
  else if (result.code === "GROUP_NOT_OPEN")
    showToast({ tone: "warning", title: COPY.groupClosed });
  else if (result.code === "RATE_LIMITED") showToast({ tone: "warning", title: COPY.rateLimited });
  else showToast({ tone: "danger", title: COPY.refused });
}

/**
 * Drives *Pilih untuk…* in the *Semua foto* viewer: picks a photo (quantity 1) in a group or
 * un-picks it, shows a refusal such as *Batas pilihan tercapai*, and re-reads the groups after one
 * (A-30, AC-SEL-019).
 * @param initial - the groups and picks loaded with the page
 * @param actions - the pick actions
 * @returns the targets and handlers
 */
export function usePickTargets(
  initial: PickTargets,
  actions: ViewerPickActions,
): PickTargetsHandle {
  const router = useRouter();
  const [targets, setTargets] = useState(initial);
  const reload = async () => {
    const next = await actions.reload().catch(() => null);
    if (next === null) showToast({ tone: "danger", title: COPY.failed });
    else if ("kind" in next) router.refresh();
    else setTargets(next);
  };
  const toggle = async (groupId: string, photoId: string) => {
    const isPicked = targets.picks.some(
      (pick) => pick.groupId === groupId && pick.photoId === photoId,
    );
    const quantity = isPicked ? 0 : 1;
    const result = await actions.setPick({ groupId, photoId, quantity }).catch(() => null);
    if (result === null) showToast({ tone: "danger", title: COPY.failed });
    else if ("kind" in result) router.refresh();
    else if (result.ok) {
      setTargets((current) =>
        withStoredPick(current, { groupId, photoId, quantity, usage: result.usage }),
      );
    } else {
      refusalToast(result);
      if (result.code !== "RATE_LIMITED") await reload();
    }
  };
  const applyNote = (groupId: string, photoId: string, note: string | null) => {
    setTargets((current) => withTargetNote(current, groupId, photoId, note));
  };
  const targetsOf = (photoId: string) => targetsOfPhoto(targets, photoId);
  return { targets, targetsOf, toggle, applyNote, reload };
}
