"use server";

import { revalidatePath } from "next/cache";

import { saveWorkspaceProfile } from "@/composition/workspace/workspace-flow/workspace-flow";
import type {
  UpdateWorkspaceProfileFailure,
  UpdateWorkspaceProfileInput,
} from "@/features/workspace/application/use-cases/update-workspace-profile/update-workspace-profile.types";

export async function saveWorkspaceSettingsAction(
  workspaceId: string,
  values: UpdateWorkspaceProfileInput,
): Promise<UpdateWorkspaceProfileFailure | undefined> {
  const result = await saveWorkspaceProfile(workspaceId, values);
  if (!result.ok) return result;
  // The Sidebar and switcher read the name in the workspace layout (AC-WS-016).
  revalidatePath("/w/[workspaceId]", "layout");
  return undefined;
}
