"use server";

import { revalidatePath } from "next/cache";

import {
  addPhotoSource,
  deletePhotoSource,
  renamePhotoSource,
  setPhotoSourceActive,
} from "@/composition/gallery/source-config-flow/source-config-flow";
import type { AddSourceInput } from "@/features/gallery/application/schemas/add-source/add-source.types";
import type { SourceNameInput } from "@/features/gallery/application/schemas/source-name/source-name.types";
import type { SourceValidationFailure } from "@/features/gallery/application/use-cases/add-workspace-source/add-workspace-source.types";
import type { DeleteSourceResult } from "@/features/gallery/application/use-cases/delete-workspace-source/delete-workspace-source.types";

const PAGE = "/w/[workspaceId]/photo-sources";

export async function addSourceAction(
  workspaceId: string,
  values: AddSourceInput,
): Promise<SourceValidationFailure | undefined> {
  const result = await addPhotoSource(workspaceId, values);
  if (!result.ok) return result;
  revalidatePath(PAGE, "page");
  return undefined;
}

export async function renameSourceAction(
  workspaceId: string,
  sourceId: string,
  values: SourceNameInput,
): Promise<SourceValidationFailure | undefined> {
  const result = await renamePhotoSource(workspaceId, sourceId, values);
  if (!result.ok) return result;
  revalidatePath(PAGE, "page");
  return undefined;
}

export async function setSourceActiveAction(
  workspaceId: string,
  sourceId: string,
  isActive: boolean,
): Promise<void> {
  await setPhotoSourceActive(workspaceId, sourceId, isActive);
  revalidatePath(PAGE, "page");
}

export async function deleteSourceAction(
  workspaceId: string,
  sourceId: string,
): Promise<DeleteSourceResult> {
  const result = await deletePhotoSource(workspaceId, sourceId);
  if (result.ok) revalidatePath(PAGE, "page");
  return result;
}
