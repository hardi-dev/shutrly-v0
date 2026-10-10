import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface DealEditTarget {
  readonly context: WorkspaceContext;
  readonly actorId: string;
  readonly projectId: string;
}
