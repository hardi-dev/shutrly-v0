"use server";

import { revalidatePath } from "next/cache";

import { addWorkspaceClient } from "@/composition/booking/client-flow/client-flow";

const PAGE = "/w/[workspaceId]/clients";

export async function addClientAction(workspaceId: string, values: unknown) {
  const result = await addWorkspaceClient(workspaceId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result.ok ? undefined : result;
}
