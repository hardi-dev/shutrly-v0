import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  AddOnRecord,
  AddOnRepositoryPort,
} from "../../ports/add-on-repository/add-on-repository.port";

/**
 * The project's add-ons, oldest first, for the *Add-on* card (spec §4, AC-ADD-001).
 * @param addOns - add-on repository
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the add-ons
 */
export function listAddOns(
  addOns: AddOnRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
): Promise<readonly AddOnRecord[]> {
  return addOns.list(context, projectId);
}
