import "server-only";

import { deriveSetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist";
import type { SetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { SetupFactsReaderPort } from "../../ports/setup-facts-reader/setup-facts-reader.port";

/** Loads the dashboard setup checklist for a verified workspace (F-25). @param reader - setup facts port @param context - ownership-verified workspace @returns the checklist, or null once the workspace has a project */
export async function loadSetupChecklist(
  reader: SetupFactsReaderPort,
  context: WorkspaceContext,
): Promise<SetupChecklist | null> {
  return deriveSetupChecklist(await reader.read(context));
}
