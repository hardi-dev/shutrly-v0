"use server";

import { redirect } from "next/navigation";

import { createOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";

export async function createWorkspaceAction(formData: FormData): Promise<void> {
  const result = await createOwnerWorkspace({ name: formString(formData, "name") });
  redirect(`/w/${result.id}`);
}

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
