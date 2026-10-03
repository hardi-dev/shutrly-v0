"use server";

import { revalidatePath } from "next/cache";

import {
  createProjectEntry,
  searchClientsEntry,
} from "@/composition/booking/project-flow/project-flow";

const PAGE = "/w/[workspaceId]/projects";

export async function createProjectAction(workspaceId: string, values: unknown) {
  const result = await createProjectEntry(workspaceId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function searchActiveClientsAction(workspaceId: string, query: unknown) {
  return searchClientsEntry(workspaceId, query);
}
