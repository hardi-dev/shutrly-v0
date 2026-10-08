import type { PickedPhotoView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import {
  remainingPlaces,
  usageOf,
} from "@/features/gallery/domain/selection-usage/selection-usage";

import type { ReviewState } from "./use-review-screen.types";

/** The usage the screen shows, from the picks it holds, so optimistic changes count at once (BR-SEL-003). @param state - the review state @returns the usage */
export function usageOfReview(state: ReviewState): number {
  return usageOf(
    state.group.mode,
    state.picks.map((pick) => pick.quantity),
  );
}

/** Places left, never negative (BR-SEL-003). @param state - the review state @returns the places left */
export function remainingOfReview(state: ReviewState): number {
  return remainingPlaces(state.group.limit, usageOfReview(state));
}

/** The highest quantity a print pick can take: what it has plus the places left (A-9). @param state - the review state @param pick - the pick @returns the maximum for its stepper */
export function maxQuantityOf(state: ReviewState, pick: PickedPhotoView): number {
  return pick.quantity + remainingOfReview(state);
}

/** Sets a pick's quantity, or removes it with quantity 0, before the server answers (A-29, A-32). @param state - the review state @param photoId - the picked photo @param quantity - the new quantity, 0 removes @returns the new state */
export function withQuantity(state: ReviewState, photoId: string, quantity: number): ReviewState {
  const picks =
    quantity === 0
      ? state.picks.filter((pick) => pick.photo.id !== photoId)
      : state.picks.map((pick) => (pick.photo.id === photoId ? { ...pick, quantity } : pick));
  return { ...state, picks };
}

/** Puts a pick back as it was, after the server refused its change (A-29). @param state - the review state @param previous - the pick before the change, in its old place @param index - where it was in the list @returns the new state */
export function withRestored(
  state: ReviewState,
  previous: PickedPhotoView,
  index: number,
): ReviewState {
  const rest = state.picks.filter((pick) => pick.photo.id !== previous.photo.id);
  return { ...state, picks: [...rest.slice(0, index), previous, ...rest.slice(index)] };
}

/** Stores a note on a pick (A-32). @param state - the review state @param photoId - the picked photo @param note - the stored note, null when cleared @returns the new state */
export function withReviewNote(
  state: ReviewState,
  photoId: string,
  note: string | null,
): ReviewState {
  return {
    ...state,
    picks: state.picks.map((pick) => (pick.photo.id === photoId ? { ...pick, note } : pick)),
  };
}
