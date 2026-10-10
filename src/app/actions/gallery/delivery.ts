"use server";

import { revalidatePath } from "next/cache";

import {
  completeProjectEntry,
  publishFinalDeliveryEntry,
} from "@/composition/gallery/delivery-flow/delivery-flow";

const PROJECTS = "/w/[workspaceId]/projects";

export async function publishFinalDeliveryAction(workspaceId: string, projectId: string) {
  const result = await publishFinalDeliveryEntry(workspaceId, projectId);
  if (result === undefined) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function completeProjectAction(workspaceId: string, projectId: string) {
  const result = await completeProjectEntry(workspaceId, projectId);
  // A stale status is refreshed too, so the card shows what really happened.
  revalidatePath(PROJECTS, "layout");
  return result;
}
