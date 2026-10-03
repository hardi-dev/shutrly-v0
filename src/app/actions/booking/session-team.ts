"use server";

import { revalidatePath } from "next/cache";

import { addSessionAssignmentEntry } from "@/composition/booking/team-flow/team-flow";

const PROJECTS = "/w/[workspaceId]/projects";

export async function addSessionAssignmentAction(
  workspaceId: string,
  projectId: string,
  sessionId: string,
  values: unknown,
) {
  const result = await addSessionAssignmentEntry(workspaceId, projectId, sessionId, values);
  // A cancelled project is refreshed too, so its read-only team shows.
  if (result.ok || result.code === "PROJECT_CANCELLED") revalidatePath(PROJECTS, "layout");
  return result;
}
