import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export type AddOnTargetVerdict = "OK" | "TARGET_LOCKED" | "TARGET_OTHER_PROJECT";

/** A selection group as the add-on card and dialogs show it (BR-SEL-002, A-10). */
export interface AddOnGroupFacts {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly status: "OPEN" | "SUBMITTED" | "LOCKED";
  /** Effective limit: base + approved add-ons. */
  readonly limit: number;
  readonly usage: number;
  /** Whether a new add-on may target it (OPEN or SUBMITTED). */
  readonly isTargetable: boolean;
}

/** Asks the selection side about a project's groups as add-on targets (BR-ADD-002, A-10). */
export interface AddOnTargetPort {
  readonly listGroups: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<readonly AddOnGroupFacts[]>;
  readonly check: (
    context: WorkspaceContext,
    projectId: string,
    groupId: string,
  ) => Promise<AddOnTargetVerdict>;
}
