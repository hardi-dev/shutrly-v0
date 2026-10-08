import "server-only";

import { and, eq, sql } from "drizzle-orm";

import type {
  InsertedSource,
  NewGallerySource,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallerySource } from "../schema/gallery/gallery";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";

/** True when the workspace source exists in this workspace and is active (BR-SRC-006). @param tx - the transaction @param context - verified workspace @param workspaceSourceId - the source id @returns whether it is active */
export async function isWorkspaceSourceActive(
  tx: DbExecutor,
  context: WorkspaceContext,
  workspaceSourceId: string,
): Promise<boolean> {
  const rows = await tx
    .select({ isActive: workspaceSourceConfig.isActive })
    .from(workspaceSourceConfig)
    .where(
      and(
        eq(workspaceSourceConfig.workspaceId, context.workspaceId),
        eq(workspaceSourceConfig.id, workspaceSourceId),
      ),
    );
  return rows.at(0)?.isActive === true;
}

/** Links a folder to a gallery; the partial unique index decides a concurrent duplicate too (AC-GAL-010). @param tx - the transaction @param context - verified workspace @param galleryId - the gallery @param source - the folder @returns the new source id or FOLDER_ALREADY_LINKED */
export async function insertGallerySource(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
  source: NewGallerySource,
): Promise<InsertedSource | "FOLDER_ALREADY_LINKED"> {
  const rows = await tx
    .insert(gallerySource)
    .values({
      workspaceId: context.workspaceId,
      galleryId,
      workspaceSourceId: source.workspaceSourceId,
      providerFolderId: source.folder.folderId,
      resourceKey: source.folder.resourceKey,
      label: source.label,
      createdBy: source.actorId,
    })
    .onConflictDoNothing({
      target: [gallerySource.galleryId, gallerySource.providerFolderId],
      where: sql`removed_at is null`,
    })
    .returning({ id: gallerySource.id });
  const row = rows.at(0);
  return row ? { sourceId: row.id } : "FOLDER_ALREADY_LINKED";
}
