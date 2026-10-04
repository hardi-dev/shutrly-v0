import "server-only";

import { and, eq } from "drizzle-orm";

import type { LockedGalleryState } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";

/** Locks a gallery FOR UPDATE and its project FOR SHARE inside a transaction, in that order (D-14, C-005). @param tx - the transaction @param context - verified workspace @param galleryId - the gallery id @returns the locked state, or null when missing */
export async function lockGallery(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<LockedGalleryState | null> {
  const row = (
    await tx
      .select({
        status: gallery.status,
        expiresAt: gallery.expiresAt,
        projectId: gallery.projectId,
      })
      .from(gallery)
      .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId)))
      .for("update")
  ).at(0);
  if (!row) return null;
  const owner = (
    await tx
      .select({ status: project.status })
      .from(project)
      .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, row.projectId)))
      .for("share")
  ).at(0);
  const status = toGalleryStatus(row.status);
  const projectStatus = owner ? toProjectStatus(owner.status) : null;
  if (!status || !projectStatus) return null;
  return { galleryId, status, expiresAt: row.expiresAt, projectStatus };
}
