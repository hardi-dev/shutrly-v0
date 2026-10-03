"use server";

import { revalidatePath } from "next/cache";

import { loadClientForEdit } from "@/composition/booking/client-flow/client-flow";
import {
  addProjectItemEntry,
  addSessionEntry,
  advanceProjectEntry,
  cancelProjectEntry,
  createProjectEntry,
  deleteDraftEntry,
  deleteSessionEntry,
  loadMoreProjectsEntry,
  loadProjectDetail,
  removeProjectItemEntry,
  searchClientsEntry,
  searchFilterClientsEntry,
  updateProjectFieldValuesEntry,
  updateProjectInfoEntry,
  updateProjectItemValueEntry,
  updateSessionEntry,
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

function refreshed<T>(result: T): T {
  if (result === undefined) revalidatePath(PAGE, "layout");
  return result;
}

export async function addProjectItemAction(ws: string, id: string, values: unknown) {
  return refreshed(await addProjectItemEntry(ws, id, values));
}

export async function updateProjectItemValueAction(
  ws: string,
  id: string,
  itemId: string,
  values: unknown,
) {
  return refreshed(await updateProjectItemValueEntry(ws, id, itemId, values));
}

export async function removeProjectItemAction(ws: string, id: string, itemId: string) {
  return refreshed(await removeProjectItemEntry(ws, id, itemId));
}

export async function updateProjectFieldValuesAction(ws: string, id: string, values: unknown) {
  return refreshed(await updateProjectFieldValuesEntry(ws, id, values));
}

export async function addSessionAction(ws: string, id: string, values: unknown) {
  return refreshed(await addSessionEntry(ws, id, values));
}

export async function updateSessionAction(
  ws: string,
  id: string,
  sessionId: string,
  values: unknown,
) {
  return refreshed(await updateSessionEntry(ws, id, sessionId, values));
}

export async function deleteSessionAction(ws: string, id: string, sessionId: string) {
  return refreshed(await deleteSessionEntry(ws, id, sessionId));
}
