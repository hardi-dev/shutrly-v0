import "server-only";

import { and, eq, sql } from "drizzle-orm";

import type {
  DeliveryGalleryFacts,
  DeliveryReaderPort,
} from "@/features/gallery/application/ports/delivery-reader/delivery-reader.port";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";

// Visible finished files: not missing, from an active source (BR-DEL-001/002, BR-GAL-009).
const finishedCount = (kind: "EDITED" | "PRINT") => sql<number>`(select count(*)::int
  from gallery_photo p join gallery_source s on s.workspace_id = p.workspace_id and s.id = p.gallery_source_id
  where p.workspace_id = ${gallery.workspaceId} and p.gallery_id = ${gallery.id}
    and p.kind = ${kind} and p.missing_at is null and s.removed_at is null)`;

interface GalleryRow {
  readonly status: string | null;
  readonly expiresAt: Date | null;
  readonly finalDeliveryPublishedAt: Date | null;
  readonly editedCount: number | null;
  readonly printCount: number | null;
}

function toGalleryFacts(row: GalleryRow): DeliveryGalleryFacts | null {
  const status = row.status ? toGalleryStatus(row.status) : null;
  if (!status) return null;
  return {
    status,
    expiresAt: row.expiresAt,
    finalDeliveryPublishedAt: row.finalDeliveryPublishedAt,
    editedCount: row.editedCount ?? 0,
    printCount: row.printCount ?? 0,
  };
}

/** Builds the *Hasil akhir* card reader, always scoped by workspace (C-101, D-20). @param db - the executor @returns the reader port */
export function createDrizzleDeliveryReader(db: DbExecutor): DeliveryReaderPort {
  return {
    async findFacts(context, projectId) {
      const rows = await db
        .select({
          title: project.title,
          projectStatus: project.status,
          completedAt: project.completedAt,
          status: gallery.status,
          expiresAt: gallery.expiresAt,
          finalDeliveryPublishedAt: gallery.finalDeliveryPublishedAt,
          editedCount: finishedCount("EDITED"),
          printCount: finishedCount("PRINT"),
        })
        .from(project)
        .leftJoin(
          gallery,
          and(eq(gallery.workspaceId, project.workspaceId), eq(gallery.projectId, project.id)),
        )
        .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)));
      const row = rows.at(0);
      const projectStatus = row ? toProjectStatus(row.projectStatus) : null;
      if (!row || !projectStatus) return null;
      return {
        projectTitle: row.title,
        projectStatus,
        completedAt: row.completedAt,
        gallery: toGalleryFacts(row),
      };
    },
  };
}
