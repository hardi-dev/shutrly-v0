"use server";

import { revalidatePath } from "next/cache";

import { lockSelectionGroupEntry } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import type { LockSelectionGroupResult } from "@/features/gallery/application/use-cases/lock-selection-group/lock-selection-group.types";

const PROJECTS = "/w/[workspaceId]/projects";

export async function lockSelectionGroupAction(
  workspaceId: string,
  projectId: string,
  input: unknown,
): Promise<LockSelectionGroupResult> {
  const result = await lockSelectionGroupEntry(workspaceId, projectId, input);
  revalidatePath(PROJECTS, "layout");
  return result;
}
