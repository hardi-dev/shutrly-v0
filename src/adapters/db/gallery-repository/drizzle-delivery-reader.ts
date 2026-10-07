import "server-only";

import { and, asc, count, eq, inArray, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";

import type {
  DeliveryGalleryFacts,
  DeliveryReaderPort,
  FinishedItemCount,
} from "@/features/gallery/application/ports/delivery-reader/delivery-reader.port";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";
import { projectItem } from "../schema/booking/project";
import { gallery, galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { toGalleryStatus, toProjectStatus } from "./gallery-rows";

// Visible finished files: not missing, from an active source (BR-DEL-001/002, BR-GAL-009).
const finishedCount = (kind: "EDITED" | "PRINT") => sql<number>`(select count(*)::int
  from gallery_photo p join gallery_source s on s.workspace_id = p.workspace_id and s.id = p.gallery_source_id
  where p.workspace_id = ${gallery.workspaceId} and p.gallery_id = ${gallery.id}
    and p.kind = ${kind} and p.missing_at is null and s.removed_at is null)`;

// Files synced before F-20 have no item; they count under their kind.
const KIND_NAMES = { EDITED: "Edited", PRINT: "Print" } as const;

/** Visible finished files per package item, in package order (F-20). @param db - the executor @param workspaceId - the workspace @param galleryId - the gallery @returns the counts */
async function selectFinishedItems(
  db: DbExecutor,
  workspaceId: string,
  galleryId: string,
): Promise<FinishedItemCount[]> {
  const rows = await db
    .select({
      kind: galleryPhoto.kind,
      itemId: projectItem.id,
      itemName: projectItem.name,
      sortOrder: projectItem.sortOrder,
      count: count(),
    })
    .from(galleryPhoto)
    .innerJoin(
      gallerySource,
      and(
        eq(gallerySource.workspaceId, galleryPhoto.workspaceId),
        eq(gallerySource.id, galleryPhoto.gallerySourceId),
      ),
    )
    .leftJoin(
      projectItem,
      and(
        eq(projectItem.workspaceId, galleryPhoto.workspaceId),
        eq(projectItem.id, galleryPhoto.projectItemId),
      ),
    )
    .where(
      and(
        eq(galleryPhoto.workspaceId, workspaceId),
        eq(galleryPhoto.galleryId, galleryId),
        inArray(galleryPhoto.kind, ["EDITED", "PRINT"]),
        isNull(galleryPhoto.missingAt),
        isNull(gallerySource.removedAt),
      ),
    )
    .groupBy(galleryPhoto.kind, projectItem.id, projectItem.name, projectItem.sortOrder)
    .orderBy(asc(projectItem.sortOrder), asc(galleryPhoto.kind));
  return rows.map((row) => {
    const kind = row.kind === "PRINT" ? "PRINT" : "EDITED";
    return {
      id: row.itemId ?? kind,
      name: row.itemName ?? KIND_NAMES[kind],
      count: row.count,
    };
  });
}

interface GalleryRow {
  readonly status: string | null;
  readonly expiresAt: Date | null;
  readonly finalDeliveryPublishedAt: Date | null;
  readonly editedCount: number | null;
  readonly printCount: number | null;
}

function toGalleryFacts(
  row: GalleryRow,
  items: readonly FinishedItemCount[],
): DeliveryGalleryFacts | null {
  const status = row.status ? toGalleryStatus(row.status) : null;
  if (!status) return null;
  return {
    status,
    expiresAt: row.expiresAt,
    finalDeliveryPublishedAt: row.finalDeliveryPublishedAt,
    editedCount: row.editedCount ?? 0,
    printCount: row.printCount ?? 0,
    items,
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
          galleryId: gallery.id,
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
        gallery: toGalleryFacts(
          row,
          row.galleryId ? await selectFinishedItems(db, context.workspaceId, row.galleryId) : [],
        ),
      };
    },
  };
}
