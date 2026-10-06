import "server-only";

import { and, asc, count, eq, sql } from "drizzle-orm";

import type {
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "@/features/gallery/application/ports/selection-repository/selection-repository.port";
import type { SelectionGroupStatus } from "@/features/gallery/domain/selection-usage/selection-usage.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { itemLimitSql } from "../gallery-repository/selection-group-sql";
import { project, projectItem } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { photoSelection, selectionGroup } from "../schema/gallery/selection";
import { pickWriter, selectPickedPhotos } from "./selection-pick-sql";

const groupColumns = {
  id: selectionGroup.id,
  projectItemId: selectionGroup.projectItemId,
  name: projectItem.name,
  unit: projectItem.unit,
  pickMode: projectItem.pickMode,
  allowsPickNotes: projectItem.allowsPickNotes,
  baseLimit: selectionGroup.baseLimit,
  extraLimit: selectionGroup.extraLimit,
  status: selectionGroup.status,
  submittedAt: selectionGroup.submittedAt,
  lockedAt: selectionGroup.lockedAt,
  sortOrder: projectItem.sortOrder,
};

interface GroupRow {
  readonly id: string;
  readonly projectItemId: string;
  readonly name: string;
  readonly unit: string | null;
  readonly pickMode: string | null;
  readonly allowsPickNotes: boolean;
  readonly baseLimit: number;
  readonly extraLimit: number;
  readonly status: string;
  readonly submittedAt: Date | null;
  readonly lockedAt: Date | null;
  readonly sortOrder: number;
  readonly pickCount: number;
  readonly quantitySum: number | string | null;
  readonly noteCount: number;
}

function toStatus(value: string): SelectionGroupStatus {
  if (value === "OPEN" || value === "SUBMITTED" || value === "LOCKED") return value;
  throw new Error("Stored selection group status is invalid.");
}

/** Maps a group row with its pick counts to the record (BR-SEL-003). @param row - the joined row @returns the record */
export function toGroupRecord(row: GroupRow): SelectionGroupRecord {
  const { pickMode, quantitySum, status, ...rest } = row;
  const mode = pickMode === "QUANTITY" ? "QUANTITY" : "COUNT";
  return {
    ...rest,
    mode,
    status: toStatus(status),
    usage: mode === "COUNT" ? row.pickCount : Number(quantitySum ?? 0),
  };
}

const pickTotals = {
  pickCount: count(photoSelection.id),
  quantitySum: sql<string | null>`sum(${photoSelection.quantity})`,
  noteCount: count(photoSelection.note),
};

/** The group-with-usage select; callers add the workspace-scoped filter. @param db - the executor @returns the dynamic query */
function groupsQuery(db: DbExecutor) {
  return db
    .select({ ...groupColumns, ...pickTotals })
    .from(selectionGroup)
    .innerJoin(
      projectItem,
      and(
        eq(projectItem.workspaceId, selectionGroup.workspaceId),
        eq(projectItem.id, selectionGroup.projectItemId),
      ),
    )
    .leftJoin(
      photoSelection,
      and(
        eq(photoSelection.workspaceId, selectionGroup.workspaceId),
        eq(photoSelection.selectionGroupId, selectionGroup.id),
      ),
    )
    .$dynamic();
}

// eslint-disable-next-line max-lines-per-function -- exposes the complete selection repository port
export function createDrizzleSelectionRepository(db: DbExecutor): SelectionRepositoryPort {
  const groupScope = (context: WorkspaceContext, groupId: string) =>
    and(eq(selectionGroup.workspaceId, context.workspaceId), eq(selectionGroup.id, groupId));
  return {
    async listGroups(context, projectId) {
      const rows = await groupsQuery(db)
        .where(
          and(
            eq(selectionGroup.workspaceId, context.workspaceId),
            eq(selectionGroup.projectId, projectId),
          ),
        )
        .groupBy(selectionGroup.id, projectItem.id)
        .orderBy(asc(projectItem.sortOrder), asc(projectItem.id));
      return rows.map(toGroupRecord);
    },
    async lockProject(context, projectId) {
      const rows = await db
        .select({ id: project.id })
        .from(project)
        .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)))
        .for("update");
      return rows.length > 0;
    },
    async findGroupByItemForUpdate(context, itemId) {
      const locked = await db
        .select({ id: selectionGroup.id })
        .from(selectionGroup)
        .where(
          and(
            eq(selectionGroup.workspaceId, context.workspaceId),
            eq(selectionGroup.projectItemId, itemId),
          ),
        )
        .for("update");
      const id = locked.at(0)?.id;
      if (!id) return null;
      const row = (
        await groupsQuery(db)
          .where(groupScope(context, id))
          .groupBy(selectionGroup.id, projectItem.id)
      ).at(0);
      return row ? toGroupRecord(row) : null;
    },
    async itemLimit(context, itemId) {
      const rows = await db
        .select({ limit: itemLimitSql })
        .from(projectItem)
        .where(and(eq(projectItem.workspaceId, context.workspaceId), eq(projectItem.id, itemId)));
      return rows.at(0)?.limit ?? 0;
    },
    async createGroupForItem(context, projectId, definitionId) {
      await db.execute(sql`
        insert into ${selectionGroup} (workspace_id, project_id, project_item_id, gallery_id, base_limit)
        select ${projectItem.workspaceId}, ${projectItem.projectId}, ${projectItem.id}, ${gallery.id}, ${itemLimitSql}
        from ${projectItem}
        join ${gallery} on ${gallery.workspaceId} = ${projectItem.workspaceId}
          and ${gallery.projectId} = ${projectItem.projectId}
        where ${projectItem.workspaceId} = ${context.workspaceId}
          and ${projectItem.projectId} = ${projectId}
          and ${projectItem.definitionId} = ${definitionId}
          and ${projectItem.selectionRequired}
          and ${gallery.status} = 'PUBLISHED'
        on conflict (project_item_id) do nothing`);
    },
    async setBaseLimit(context, groupId, base) {
      await db
        .update(selectionGroup)
        .set({ baseLimit: base, updatedAt: new Date() })
        .where(groupScope(context, groupId));
    },
    async deleteGroup(context, groupId) {
      await db.delete(selectionGroup).where(groupScope(context, groupId));
    },
    withLockedGroup: (context, projectId, groupId, work) =>
      db.transaction(async (tx) => {
        const locked = await tx
          .select({ galleryId: selectionGroup.galleryId })
          .from(selectionGroup)
          .where(and(groupScope(context, groupId), eq(selectionGroup.projectId, projectId)))
          .for("update");
        const galleryId = locked.at(0)?.galleryId;
        if (!galleryId) return "NOT_FOUND" as const;
        const row = (
          await groupsQuery(tx)
            .where(groupScope(context, groupId))
            .groupBy(selectionGroup.id, projectItem.id)
        ).at(0);
        if (!row) return "NOT_FOUND" as const;
        return work(toGroupRecord(row), pickWriter(tx, { context, groupId, galleryId }));
      }),
    listPickedPhotos: (context, projectId) => selectPickedPhotos(db, context, projectId),
  };
}
