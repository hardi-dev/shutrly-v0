import "server-only";

import { createDrizzleSelectionOwnerReader } from "@/adapters/db/selection-repository/drizzle-selection-owner-reader";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import { getSelectionCard } from "@/features/gallery/application/use-cases/get-selection-card/get-selection-card";
import { getSelectionGroupDetail } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail";
import { listSelectionGroups } from "@/features/gallery/application/use-cases/list-selection-groups/list-selection-groups";
import { lockSelectionGroup } from "@/features/gallery/application/use-cases/lock-selection-group/lock-selection-group";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { withRequestDb } from "../../request-db/request-db";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import {
  galleryIdOrNotFound,
  gallerySaveError,
} from "../gallery-flow-support/gallery-flow-support";

/** Runs the Owner's selection work with request-scoped repositories. @param work - the work with the selection repository and the Owner reader @returns whatever `work` resolves to */
function withSelectionOwnerScope<T>(
  work: (scope: {
    selections: ReturnType<typeof createDrizzleSelectionRepository>;
    owner: ReturnType<typeof createDrizzleSelectionOwnerReader>;
    now: Date;
  }) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    work({
      selections: createDrizzleSelectionRepository(db),
      owner: createDrizzleSelectionOwnerReader(db),
      now: new Date(),
    }),
  );
}

/** Loads the project page's *Pilihan klien* card (A-34, AC-SEL-010). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the card view */
export async function loadSelectionCard(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withSelectionOwnerScope((scope) =>
      getSelectionCard(scope, verified.context, projectId),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "selection-card");
  }
}

/** Loads the *Pilihan klien* page: every group with status, usage and a photo strip (A-34). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the page view */
export async function loadSelectionGroups(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withSelectionOwnerScope((scope) =>
      listSelectionGroups(scope, verified.context, projectId),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "selection-groups");
  }
}

/** Loads one group with its picks for the Owner (AC-SEL-010, AC-SEL-015). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @param rawGroupId - untrusted group id @returns the detail view */
export async function loadSelectionGroupDetail(
  rawWorkspaceId: string,
  rawProjectId: string,
  rawGroupId: string,
) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withSelectionOwnerScope((scope) =>
      getSelectionGroupDetail(scope, verified.context, projectId, rawGroupId),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "selection-detail");
  }
}

/** Locks or closes a group for the signed-in Owner (AC-SEL-011, BR-AUD-001). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @param input - untrusted `{ groupId, intent }` @returns the lock result */
export async function lockSelectionGroupEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  input: unknown,
) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withSelectionOwnerScope(({ selections, now }) =>
      lockSelectionGroup({ selections, now }, verified.context, account.id, projectId, input),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "selection-lock");
  }
}
