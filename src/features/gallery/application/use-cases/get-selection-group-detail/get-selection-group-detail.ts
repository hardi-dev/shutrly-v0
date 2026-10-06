import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { selectionGroupIdSchema } from "../../schemas/gallery-ids/gallery-ids.schema";
import {
  loadOwnerSelection,
  toOwnerGroupView,
} from "../owner-selection-views/owner-selection-views";
import type { SelectionOwnerDeps } from "../owner-selection-views/owner-selection-views.types";
import type { SelectionGroupDetailView } from "./get-selection-group-detail.types";

/**
 * Loads one group for the Owner: summary, and every pick with file name, folder, quantity and note,
 * flagging picked photos that went missing (A-8, A-34, AC-SEL-010, AC-SEL-015).
 * @param deps - selection repository and the Owner reader
 * @param context - verified workspace
 * @param projectId - the project id
 * @param rawGroupId - untrusted group id from the route
 * @returns the detail view
 * @throws GalleryError NOT_FOUND for a malformed id, another project's group or another workspace
 */
export async function getSelectionGroupDetail(
  deps: SelectionOwnerDeps,
  context: WorkspaceContext,
  projectId: string,
  rawGroupId: string,
): Promise<SelectionGroupDetailView> {
  const groupId = selectionGroupIdSchema.safeParse(rawGroupId);
  if (!groupId.success) throw new GalleryError("NOT_FOUND");
  const { facts, groups } = await loadOwnerSelection(deps, context, projectId);
  const group = groups.find((candidate) => candidate.id === groupId.data);
  if (!group) throw new GalleryError("NOT_FOUND");
  const picked = await deps.selections.listPickedPhotos(context, projectId);
  const picks = picked
    .filter((pick) => pick.groupId === group.id)
    .map(({ photoId, fileName, folderPath, quantity, note, missing }) => ({
      photoId,
      fileName,
      folderPath,
      quantity,
      note,
      missing,
    }));
  const missing = picks.filter((pick) => pick.missing);
  const latest = Math.max(
    0,
    ...picked.filter((pick) => pick.groupId === group.id).map((pick) => pick.changedAt.getTime()),
  );
  return {
    projectTitle: facts.projectTitle,
    group: toOwnerGroupView(group),
    picks,
    changedAt: latest === 0 ? null : new Date(latest).toISOString(),
    missingCount: missing.length,
    missingNames: missing.map((pick) => pick.fileName),
  };
}
