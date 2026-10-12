import "server-only";

import type { SetupFacts } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** Reads what a workspace already has for the setup checklist, scoped to the verified workspace (F-25 D-2). */
export interface SetupFactsReaderPort {
  readonly read: (context: WorkspaceContext) => Promise<SetupFacts>;
}
