import "server-only";

import { getWorkspaceProfile } from "@/features/workspace/application/use-cases/get-workspace-profile/get-workspace-profile";
import { listOwnerWorkspaces } from "@/features/workspace/application/use-cases/list-owner-workspaces/list-owner-workspaces";
import { updateWorkspaceProfile } from "@/features/workspace/application/use-cases/update-workspace-profile/update-workspace-profile";
import type { UpdateWorkspaceProfileInput } from "@/features/workspace/application/use-cases/update-workspace-profile/update-workspace-profile.types";
import { isComingSoonSection } from "@/features/workspace/domain/coming-soon-sections/coming-soon-sections";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../owner-workspace/owner-workspace";
import { withWorkspaceScope } from "../workspace-scope/workspace-scope";

export { isComingSoonSection };

/** Loads a verified workspace profile for its settings page. @param rawId - untrusted route ID @returns the verified workspace and profile */
export async function loadWorkspaceProfile(rawId: string) {
  const verified = await verifyOwnerWorkspace(rawId);
  const profile = await withWorkspaceScope(({ repository }) =>
    getWorkspaceProfile(repository, verified.context),
  );
  if (!profile) throw new Error("verified workspace profile disappeared");
  return { verified, profile };
}

/** Lists the owner's workspaces from a verified current workspace. @param rawId - current route ID @returns sorted switcher data */
export async function loadWorkspaceSwitcher(rawId: string) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  return withWorkspaceScope(({ repository }) =>
    listOwnerWorkspaces(repository, asOwnerUserId(account.id), verified.context),
  );
}

/** Saves branding for the verified workspace in the route. @param rawId - bound route ID @param input - untrusted profile fields @returns the update result */
export async function saveWorkspaceProfile(rawId: string, input: UpdateWorkspaceProfileInput) {
  const verified = await verifyOwnerWorkspace(rawId);
  return withWorkspaceScope(({ repository }) =>
    updateWorkspaceProfile(repository, verified.context, input),
  );
}
