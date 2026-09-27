import { workspaceNameSchema } from "./workspace-name.schema";
import type { WorkspaceName } from "./workspace-name.types";

export const WORKSPACE_NAME_MAX = 60;

/** Trims and validates a workspace name according to A-1. @param raw - the submitted name @returns the branded workspace name */
export function normaliseWorkspaceName(raw: string): WorkspaceName {
  return workspaceNameSchema.parse(raw);
}

/** Produces the case-insensitive comparison key used by workspace fakes and messages. @param name - a workspace name @returns the locale-normalised comparison key */
export function workspaceNameKey(name: string): string {
  return name.trim().toLocaleLowerCase("id-ID");
}
