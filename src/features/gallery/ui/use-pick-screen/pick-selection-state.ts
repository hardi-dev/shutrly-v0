import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type {
  OtherGroupPick,
  PickView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { usageOf } from "@/features/gallery/domain/selection-usage/selection-usage";

import type { PickSelectionState } from "./use-pick-screen.types";

function groupOthers(picks: readonly OtherGroupPick[]) {
  const byPhoto = new Map<string, OtherGroupPick[]>();
  for (const pick of picks) byPhoto.set(pick.photoId, [...(byPhoto.get(pick.photoId) ?? []), pick]);
  return byPhoto;
}

/** The selection state of a Pilih screen from a server view (A-25). @param view - the group, its picks and the other groups' picks @returns the state */
export function selectionStateOf(view: PickView): PickSelectionState {
  return {
    group: view.group,
    picks: new Map(view.picks.map((pick) => [pick.photo.id, pick])),
    otherPicks: groupOthers(view.otherPicks),
  };
}

/** The usage the screen shows, from the picks it holds, so optimistic changes count at once (BR-SEL-003). @param state - the selection state @returns the usage */
export function usageOfState(state: PickSelectionState): number {
  const quantities = Array.from(state.picks.values(), (pick) => pick.quantity);
  return usageOf(state.group.mode, quantities);
}

/** Applies a pick (quantity 1) or an un-pick to the state, before the server answers (A-7). @param state - the selection state @param photo - the photo @param isSelected - pick or un-pick @returns the new state */
export function withPick(
  state: PickSelectionState,
  photo: ClientPhotoView,
  isSelected: boolean,
): PickSelectionState {
  const picks = new Map(state.picks);
  if (isSelected) picks.set(photo.id, { photo, quantity: 1, note: null });
  else picks.delete(photo.id);
  return { ...state, picks };
}

/** Stores a note on a pick of the state (A-32). @param state - the selection state @param photoId - the picked photo @param note - the stored note, null when cleared @returns the new state */
export function withNote(
  state: PickSelectionState,
  photoId: string,
  note: string | null,
): PickSelectionState {
  const pick = state.picks.get(photoId);
  if (!pick) return state;
  const picks = new Map(state.picks);
  picks.set(photoId, { ...pick, note });
  return { ...state, picks };
}
