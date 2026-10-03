"use server";

import { revalidatePath } from "next/cache";

import {
  addWorkspaceClient,
  deleteWorkspaceClient,
  loadMoreClients,
  setWorkspaceClientArchived,
  updateWorkspaceClient,
} from "@/composition/booking/client-flow/client-flow";

const PAGE = "/w/[workspaceId]/clients";

export async function addClientAction(workspaceId: string, values: unknown) {
  const result = await addWorkspaceClient(workspaceId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result.ok ? undefined : result;
}

export async function loadMoreClientsAction(workspaceId: string, query: unknown) {
  return loadMoreClients(workspaceId, query);
}

export async function setClientArchivedAction(
  workspaceId: string,
  clientId: string,
  isArchived: boolean,
): Promise<void> {
  await setWorkspaceClientArchived(workspaceId, clientId, isArchived);
  revalidatePath(PAGE, "layout");
}

export async function deleteClientAction(workspaceId: string, clientId: string) {
  const result = await deleteWorkspaceClient(workspaceId, clientId);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function updateClientAction(workspaceId: string, clientId: string, values: unknown) {
  const result = await updateWorkspaceClient(workspaceId, clientId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result.ok ? undefined : result;
}
