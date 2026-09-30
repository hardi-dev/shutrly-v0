"use server";

import { redirect } from "next/navigation";

import { createOwnerFirstWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";

export async function createFirstWorkspaceAction(formData: FormData): Promise<void> {
  const result = await createOwnerFirstWorkspace({ name: formString(formData, "name") });
  redirect(`/w/${result.id}?state=created`);
}

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
