"use server";

import { revalidatePath } from "next/cache";

import {
  approveAddOnEntry,
  cancelAddOnEntry,
  createAddOnEntry,
  deleteDraftAddOnEntry,
} from "@/composition/booking/add-on-flow/add-on-flow";

const PROJECTS = "/w/[workspaceId]/projects";

export async function createAddOnAction(workspaceId: string, projectId: string, values: unknown) {
  const result = await createAddOnEntry(workspaceId, projectId, values);
  if (result.ok) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function approveAddOnAction(workspaceId: string, projectId: string, input: unknown) {
  const result = await approveAddOnEntry(workspaceId, projectId, input);
  if (result === undefined) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function cancelAddOnAction(workspaceId: string, projectId: string, input: unknown) {
  const result = await cancelAddOnEntry(workspaceId, projectId, input);
  if (result === undefined) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function deleteDraftAddOnAction(
  workspaceId: string,
  projectId: string,
  input: unknown,
) {
  const result = await deleteDraftAddOnEntry(workspaceId, projectId, input);
  if (result === undefined) revalidatePath(PROJECTS, "layout");
  return result;
}
