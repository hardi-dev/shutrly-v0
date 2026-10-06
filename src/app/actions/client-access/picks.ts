"use server";

import type { SignedOut } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import {
  browsePickPhotosEntry,
  reloadPickEntry,
  setPickEntry,
  setPickNoteEntry,
} from "@/composition/gallery/client-selection-flow/client-selection-flow";
import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type { PickViewResult } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";

export async function setPickAction(
  token: string,
  input: unknown,
): Promise<SetPickResult | SignedOut> {
  return setPickEntry(token, input);
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
