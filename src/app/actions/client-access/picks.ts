"use server";

import type { SignedOut } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import {
  browsePickPhotosEntry,
  reloadPickEntry,
  reloadPickTargetsEntry,
  reloadReviewEntry,
  setPickEntry,
  setPickNoteEntry,
  setPicksEntry,
  submitSelectionGroupEntry,
} from "@/composition/gallery/client-selection-flow/client-selection-flow";
import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type { PickViewResult } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type { ReviewResult } from "@/features/gallery/application/use-cases/get-review/get-review.types";
import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import type { SetPicksResult } from "@/features/gallery/application/use-cases/set-picks/set-picks.types";
import type { SubmitSelectionGroupResult } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group.types";

export async function setPickAction(
  token: string,
  input: unknown,
): Promise<SetPickResult | SignedOut> {
  return setPickEntry(token, input);
}

export async function setPicksAction(
  token: string,
  input: unknown,
): Promise<SetPicksResult | SignedOut> {
  return setPicksEntry(token, input);
}

export async function setPickNoteAction(
  token: string,
  input: unknown,
): Promise<SetPickNoteResult | SignedOut> {
  return setPickNoteEntry(token, input);
}

export async function browsePickPhotosAction(
  token: string,
  cursor: unknown,
): Promise<PickPhotosPage | SignedOut> {
  return browsePickPhotosEntry(token, cursor);
}

export async function reloadPickViewAction(
  token: string,
  groupId: unknown,
): Promise<PickViewResult | SignedOut> {
  return reloadPickEntry(token, groupId);
}

export async function reloadPickTargetsAction(token: string): Promise<PickTargets | SignedOut> {
  return reloadPickTargetsEntry(token);
}

export async function reloadReviewAction(
  token: string,
  groupId: unknown,
): Promise<ReviewResult | SignedOut> {
  return reloadReviewEntry(token, groupId);
}

export async function submitSelectionGroupAction(
  token: string,
  input: unknown,
): Promise<SubmitSelectionGroupResult | SignedOut> {
  return submitSelectionGroupEntry(token, input);
}
