import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface AddOnTarget {
  readonly context: WorkspaceContext;
  readonly actorId: string;
  readonly projectId: string;
  readonly now: Date;
}
