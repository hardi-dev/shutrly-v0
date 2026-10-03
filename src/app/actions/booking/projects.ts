"use server";

import { revalidatePath } from "next/cache";

import { loadClientForEdit } from "@/composition/booking/client-flow/client-flow";
import {
  advanceProjectEntry,
  cancelProjectEntry,
  createProjectEntry,
  deleteDraftEntry,
  loadMoreProjectsEntry,
  loadProjectDetail,
  searchClientsEntry,
  searchFilterClientsEntry,
  updateProjectInfoEntry,
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

export async function advanceProjectAction(workspaceId: string, projectId: string, step: unknown) {
  const result = await advanceProjectEntry(workspaceId, projectId, step);
  if (result === undefined) revalidatePath(PAGE, "layout");
  return result;
}

export async function loadMoreProjectsAction(workspaceId: string, query: unknown) {
  return loadMoreProjectsEntry(workspaceId, query);
}

export async function searchFilterClientsAction(workspaceId: string, query: unknown) {
  return searchFilterClientsEntry(workspaceId, query);
}

export async function updateProjectInfoAction(
  workspaceId: string,
  projectId: string,
  values: unknown,
) {
  const result = await updateProjectInfoEntry(workspaceId, projectId, values);
  if (result === undefined) revalidatePath(PAGE, "layout");
  return result;
}

export async function cancelProjectAction(workspaceId: string, projectId: string, values: unknown) {
  const result = await cancelProjectEntry(workspaceId, projectId, values);
  if (result === undefined) revalidatePath(PAGE, "layout");
  return result;
}

export async function deleteDraftAction(workspaceId: string, projectId: string) {
  const result = await deleteDraftEntry(workspaceId, projectId);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function loadClientForEditAction(workspaceId: string, clientId: string) {
  return loadClientForEdit(workspaceId, clientId);
}

export async function loadProjectDetailAction(workspaceId: string, projectId: string) {
  return loadProjectDetail(workspaceId, projectId);
}
