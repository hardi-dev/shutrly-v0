"use server";

import { revalidatePath } from "next/cache";

import {
  completeProjectEntry,
  markDeliveredEntry,
} from "@/composition/gallery/delivery-flow/delivery-flow";

const PROJECTS = "/w/[workspaceId]/projects";

/** Marks the project delivered from the header or the menu (AC-GFL-017); the refusal names what is missing. @param workspaceId - workspace id @param projectId - project id @returns undefined once written, or the refusal */
export async function markDeliveredAction(workspaceId: string, projectId: string) {
  const result = await markDeliveredEntry(workspaceId, projectId);
  if (result === undefined) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function completeProjectAction(workspaceId: string, projectId: string) {
  const result = await completeProjectEntry(workspaceId, projectId);
  // A stale status is refreshed too, so the card shows what really happened.
  revalidatePath(PROJECTS, "layout");
  return result;
}
