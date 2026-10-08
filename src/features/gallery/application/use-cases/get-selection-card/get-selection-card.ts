import "server-only";

import { selectionCardState } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import {
  loadOwnerSelection,
  toOwnerGroupView,
} from "../owner-selection-views/owner-selection-views";
import type {
  SelectionCardView,
  SelectionOwnerDeps,
} from "../owner-selection-views/owner-selection-views.types";

/**
 * Loads the *Pilihan klien* card of the project page: its state (A–E) and the groups with status and
 * usage (A-34, AC-SEL-010).
 * @param deps - selection repository and the Owner reader
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the card view
 * @throws GalleryError NOT_FOUND for another workspace's project
 */
export async function getSelectionCard(
  deps: SelectionOwnerDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<SelectionCardView> {
  const { facts, groups } = await loadOwnerSelection(deps, context, projectId);
  return {
    projectTitle: facts.projectTitle,
    state: selectionCardState({
      itemCount: facts.selectionItemCount,
      statuses: groups.map((group) => group.status),
    }),
    groups: groups.map(toOwnerGroupView),
    galleryExists: facts.galleryExists,
  };
}
