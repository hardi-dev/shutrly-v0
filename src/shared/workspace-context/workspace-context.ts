import { workspaceIdSchema } from "./workspace-context.schema";
import type { WorkspaceId } from "./workspace-context.types";

/**
 * Brand a raw UUID as a `WorkspaceId`. This checks the format only, not ownership.
 * @param raw - a UUID string
 * @returns the branded ID; throws `Invalid WorkspaceId` for anything else
 */
export function asWorkspaceId(raw: string): WorkspaceId {
  const result = workspaceIdSchema.safeParse(raw);
  if (!result.success) throw new Error("Invalid WorkspaceId");
  return result.data;
}
