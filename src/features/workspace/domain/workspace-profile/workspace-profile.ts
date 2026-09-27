import { workspaceProfileSchema } from "./workspace-profile.schema";
import type { WorkspaceProfile, WorkspaceProfileInput } from "./workspace-profile.types";

/** Validates and normalises editable workspace branding fields, converting empty optional values to null. @param input - the submitted profile fields @returns the normalised workspace profile */
export function normaliseWorkspaceProfile(input: WorkspaceProfileInput): WorkspaceProfile {
  return workspaceProfileSchema.parse(input);
}

/** Resolves the client-facing brand name with the workspace name as its fallback. @param profile - the workspace profile @returns the effective brand name */
export function clientBrandName(profile: WorkspaceProfile): string {
  return profile.brandName ?? profile.name;
}
