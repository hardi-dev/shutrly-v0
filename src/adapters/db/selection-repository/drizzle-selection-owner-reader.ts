import "server-only";

import { and, count, eq } from "drizzle-orm";

import type { SelectionOwnerReaderPort } from "@/features/gallery/application/ports/selection-owner-reader/selection-owner-reader.port";

import type { DbExecutor } from "../client/client.types";
import { project, projectItem } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";

/** Builds the Owner's selection reader: the project title, whether it has a gallery and how many selection items its package holds, always scoped by workspace (C-101, A-34). @param db - the executor @returns the reader port */
export function createDrizzleSelectionOwnerReader(db: DbExecutor): SelectionOwnerReaderPort {
  return {
    async findFacts(context, projectId) {
      const rows = await db
        .select({ title: project.title, galleryId: gallery.id })
        .from(project)
        .leftJoin(
          gallery,
          and(eq(gallery.workspaceId, project.workspaceId), eq(gallery.projectId, project.id)),
        )
        .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)));
      const row = rows.at(0);
      if (!row) return null;
      const items = await db
        .select({ total: count() })
        .from(projectItem)
        .where(
          and(
            eq(projectItem.workspaceId, context.workspaceId),
            eq(projectItem.projectId, projectId),
            eq(projectItem.selectionRequired, true),
          ),
        );
      return {
        projectTitle: row.title,
        galleryExists: row.galleryId !== null,
        selectionItemCount: items.at(0)?.total ?? 0,
      };
    },
  };
}
