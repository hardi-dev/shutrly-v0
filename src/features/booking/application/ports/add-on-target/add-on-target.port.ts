import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export type AddOnTargetVerdict = "OK" | "TARGET_LOCKED" | "TARGET_OTHER_PROJECT";

/** Asks the selection side whether a group may be an add-on target (BR-ADD-002, A-10). */
export interface AddOnTargetPort {
  readonly check: (
    context: WorkspaceContext,
    projectId: string,
    groupId: string,
  ) => Promise<AddOnTargetVerdict>;
}
