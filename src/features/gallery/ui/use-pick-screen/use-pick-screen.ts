"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type { PickedPhotoView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type { SetPickResult } from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { PICK_COPY } from "../pick-screen/pick-screen.copy";
import { selectionStateOf, usageOfState, withNote, withPick } from "./pick-selection-state";
import type {
  PickGridHandle,
  PickGridState,
  PickScreenActions,
  PickSelectionHandle,
  PickSelectionState,
  UsePickSelectionInput,
} from "./use-pick-screen.types";

type SendOutcome = SetPickResult | "SIGNED_OUT" | "FAILED";

async function sendPick(
  actions: PickScreenActions,
  groupId: string,
  photoId: string,
  isSelected: boolean,
): Promise<SendOutcome> {
  try {
    const result = await actions.setPick({ groupId, photoId, quantity: isSelected ? 1 : 0 });
    return "kind" in result ? "SIGNED_OUT" : result;
  } catch {
    return "FAILED";
  }
}

function undo(
  state: PickSelectionState,
  photoId: string,
  previous: PickedPhotoView | undefined,
): PickSelectionState {
  const picks = new Map(state.picks);
  if (previous) picks.set(photoId, previous);
  else picks.delete(photoId);
  return { ...state, picks };
}

/**
 * Drives Pilih's picks: one tap picks or un-picks at once (A-7), the screen counts it before the
 * server answers, and a refusal undoes it and re-reads the group (D-12, AC-SEL-002/003).
 * @param input - the server view, the token and the Pilih actions
 * @returns the selection state and handlers
 */
export function usePickSelection({
  view,
  token,
  actions,
}: UsePickSelectionInput): PickSelectionHandle {
  const router = useRouter();
  const [state, setState] = useState(() => selectionStateOf(view));
  const groupId = view.group.id;
  const reload = async () => {
    const result = await actions.reload(groupId).catch(() => null);
    if (result === null) showToast({ tone: "danger", title: PICK_COPY.failed });
    else if (result.kind === "VIEW") setState(selectionStateOf(result.view));
    else if (result.kind === "NOT_OPEN") router.replace(`/g/${token}/picks/${groupId}/review`);
    else router.refresh();
  };
  const settle = (outcome: SendOutcome) => {
    if (outcome === "SIGNED_OUT") router.refresh();
    else if (outcome === "FAILED") showToast({ tone: "danger", title: PICK_COPY.failed });
    else if (outcome.ok) return;
    else if (outcome.code === "RATE_LIMITED")
      showToast({ tone: "warning", title: PICK_COPY.rateLimited });
    else {
      if (outcome.code === "PHOTO_NOT_SELECTABLE")
        showToast({ tone: "danger", title: PICK_COPY.refused });
      void reload();
    }
  };
  const toggle = (photo: ClientPhotoView, isSelected: boolean) => {
    const previous = state.picks.get(photo.id);
    setState((current) => withPick(current, photo, isSelected));
    const finish = (outcome: SendOutcome) => {
      if (typeof outcome !== "string" && outcome.ok) return;
      setState((current) => undo(current, photo.id, previous));
      settle(outcome);
    };
    void sendPick(actions, groupId, photo.id, isSelected).then(finish);
  };
  const applyNote = (photoId: string, note: string | null) => {
    setState((current) => withNote(current, photoId, note));
  };
  const usage = usageOfState(state);
  return { state, usage, isFull: usage >= state.group.limit, toggle, applyNote, reload };
}

function gridOf(page: PickPhotosPage | null): PickGridState {
  return {
    photos: page?.photos ?? [],
    total: page?.total ?? 0,
    nextCursor: page?.nextCursor ?? null,
    isLoadingMore: false,
    hasFailed: page === null,
  };
}

/**
 * Pages Pilih's flat grid 48 at a time with infinite scroll, and retries a failed first page.
 * @param actions - the Pilih actions
 * @param initialPage - the first page from the server, null when it failed
 * @returns the grid state and handlers
 */
export function usePickGrid(
  actions: PickScreenActions,
  initialPage: PickPhotosPage | null,
): PickGridHandle {
  const router = useRouter();
  const [state, setState] = useState(() => gridOf(initialPage));
  const fetchPage = async (cursor: PickGridState["nextCursor"]) => {
    const page = await actions.browse(cursor).catch(() => null);
    if (page !== null && "kind" in page) router.refresh();
    return page !== null && "kind" in page ? null : page;
  };
  const loadMore = async () => {
    if (state.nextCursor === null || state.isLoadingMore) return;
    setState((current) => ({ ...current, isLoadingMore: true }));
    const page = await fetchPage(state.nextCursor);
    setState((current) =>
      page === null
        ? { ...current, isLoadingMore: false }
        : {
            ...current,
            photos: [...current.photos, ...page.photos],
            nextCursor: page.nextCursor,
            isLoadingMore: false,
          },
    );
  };
  const retry = async () => {
    setState(gridOf(await fetchPage(null)));
  };
  return { state, loadMore, retry };
}
