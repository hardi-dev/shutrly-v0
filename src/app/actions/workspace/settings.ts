"use server";

import { saveWorkspaceProfile } from "@/composition/workspace/workspace-flow/workspace-flow";

export async function saveWorkspaceSettingsAction(
  workspaceId: string,
  formData: FormData,
): Promise<void> {
  await saveWorkspaceProfile(workspaceId, {
    name: formString(formData, "name"),
    brandName: formString(formData, "brandName"),
    contactEmail: formString(formData, "contactEmail"),
    phone: formString(formData, "phone"),
    address: formString(formData, "address"),
    invoicePrefix: formString(formData, "invoicePrefix"),
  });
}

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
