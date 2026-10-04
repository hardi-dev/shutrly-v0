import "server-only";

import { and, eq } from "drizzle-orm";

import type { LockedGalleryState } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";

/** Locks the gallery's project FOR SHARE, then the gallery FOR UPDATE, inside a transaction. Cancelling takes the project FOR UPDATE first, so the same order everywhere avoids deadlocks (D-14, D-15, C-005). @param tx - the transaction @param context - verified workspace @param galleryId - the gallery id @returns the locked state, or null when missing */
export async function lockGallery(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<LockedGalleryState | null> {
  const scope = and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.id, galleryId));
  // A gallery's project never changes, so reading it before the locks is safe.
  const link = (await tx.select({ projectId: gallery.projectId }).from(gallery).where(scope)).at(0);
  if (!link) return null;
  const owner = (
    await tx
      .select({ status: project.status })
      .from(project)
      .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, link.projectId)))
      .for("share")
  ).at(0);
  const row = (
    await tx
      .select({
        status: gallery.status,
        expiresAt: gallery.expiresAt,
        expiryDays: gallery.expiryDays,
      })
      .from(gallery)
      .where(scope)
      .for("update")
  ).at(0);
  const status = row ? toGalleryStatus(row.status) : null;
  const projectStatus = owner ? toProjectStatus(owner.status) : null;
  if (!row || !status || !projectStatus) return null;
  return { galleryId, status, expiresAt: row.expiresAt, expiryDays: row.expiryDays, projectStatus };
}
