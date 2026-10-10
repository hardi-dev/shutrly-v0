import "server-only";

import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { SelectionGroupRecord } from "../../ports/selection-repository/selection-repository.port";
import type { OwnerGroupView, SelectionOwnerDeps } from "./owner-selection-views.types";

/** The Owner's view of a group with its effective limit (BR-SEL-002, A-34). @param group - the stored group @returns the view */
export function toOwnerGroupView(group: SelectionGroupRecord): OwnerGroupView {
  return {
    id: group.id,
    name: group.name,
    unit: group.unit,
    mode: group.mode,
    status: group.status,
    usage: group.usage,
    limit: effectiveLimit(group.baseLimit, group.extraLimit),
    pickCount: group.pickCount,
    noteCount: group.noteCount,
    submittedAt: group.submittedAt?.toISOString() ?? null,
    lockedAt: group.lockedAt?.toISOString() ?? null,
  };
}

/** Loads the project's facts and groups for an Owner view, scoped to the workspace (C-101). @param deps - selection repository and the Owner reader @param context - verified workspace @param projectId - the project @returns the facts and the groups @throws GalleryError NOT_FOUND for another workspace's project */
export async function loadOwnerSelection(
  deps: SelectionOwnerDeps,
  context: WorkspaceContext,
  projectId: string,
) {
  const facts = await deps.owner.findFacts(context, projectId);
  if (!facts) throw new GalleryError("NOT_FOUND");
  const groups = await deps.selections.listGroups(context, projectId);
  return { facts, groups };
}
