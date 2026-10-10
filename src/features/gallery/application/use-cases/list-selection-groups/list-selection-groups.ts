import "server-only";

import { selectionCardState } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import {
  loadOwnerSelection,
  toOwnerGroupView,
} from "../owner-selection-views/owner-selection-views";
import type { SelectionOwnerDeps } from "../owner-selection-views/owner-selection-views.types";
import type { SelectionGroupsView } from "./list-selection-groups.types";

/** How many thumbnails a group's card shows before *+n* (owner-1 exports). */
export const PREVIEW_LIMIT = 8;

/**
 * Loads the *Pilihan klien* page: every group with status, usage and a strip of its picked photos
 * that are still present (A-34, AC-SEL-010).
 * @param deps - selection repository and the Owner reader
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the page view
 * @throws GalleryError NOT_FOUND for another workspace's project
 */
export async function listSelectionGroups(
  deps: SelectionOwnerDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<SelectionGroupsView> {
  const { facts, groups } = await loadOwnerSelection(deps, context, projectId);
  const picked = await deps.selections.listPickedPhotos(context, projectId);
  return {
    projectTitle: facts.projectTitle,
    state: selectionCardState({
      itemCount: facts.selectionItemCount,
      statuses: groups.map((group) => group.status),
    }),
    galleryExists: facts.galleryExists,
    groups: groups.map((group) => {
      const present = picked.filter((pick) => pick.groupId === group.id && !pick.missing);
      return {
        ...toOwnerGroupView(group),
        preview: {
          photoIds: present.slice(0, PREVIEW_LIMIT).map((pick) => pick.photoId),
          more: Math.max(0, present.length - PREVIEW_LIMIT),
        },
      };
    }),
  };
}
