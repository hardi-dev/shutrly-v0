"use server";

import { revalidatePath } from "next/cache";

import { rotateClientLinkEntry } from "@/composition/booking/client-link-flow/client-link-flow";

const PROJECTS = "/w/[workspaceId]/projects";

export async function rotateClientLinkAction(workspaceId: string, projectId: string) {
  const result = await rotateClientLinkEntry(workspaceId, projectId);
  revalidatePath(PROJECTS, "layout");
  return result;
}
