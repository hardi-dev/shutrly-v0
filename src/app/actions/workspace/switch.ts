"use server";

import { redirect } from "next/navigation";

import { enterWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";

export async function switchWorkspaceAction(workspaceId: string): Promise<void> {
  const verified = await enterWorkspace(workspaceId);
  redirect(`/w/${verified.context.workspaceId}`);
}
