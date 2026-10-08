import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import {
  auditColumns,
  idColumn,
  tenantKey,
  tenantRef,
  workspaceIdColumn,
} from "../_conventions/tenant";
import { user } from "../auth/auth";
import { project, projectItem } from "../booking/project";
import { gallery, galleryPhoto } from "./gallery";

// F-10 client selection (BR-SEL-001…006, TD D-9…D-12). The effective limit is
// base_limit + extra_limit and is never stored; usage is counted from photo_selection.
export const selectionGroup = pgTable(
  "selection_group",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    projectItemId: uuid("project_item_id").notNull(),
    galleryId: uuid("gallery_id").notNull(),
    baseLimit: integer("base_limit").notNull(),
    extraLimit: integer("extra_limit").notNull().default(0),
    status: text("status").notNull().default("OPEN"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: text("locked_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    unique("selection_group_item_uq").on(t.projectItemId),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectItemId },
      { workspaceId: projectItem.workspaceId, id: projectItem.id },
    ).onDelete("restrict"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.galleryId },
      { workspaceId: gallery.workspaceId, id: gallery.id },
    ).onDelete("cascade"),
    index("selection_group_project_ix").on(t.projectId),
    check("selection_group_base_limit_ck", sql`${t.baseLimit} >= 0`),
    check("selection_group_extra_limit_ck", sql`${t.extraLimit} >= 0`),
    check("selection_group_status_ck", sql`${t.status} in ('OPEN','SUBMITTED','LOCKED')`),
    check("selection_group_locked_ck", sql`(${t.status} = 'LOCKED') = (${t.lockedAt} is not null)`),
  ],
);

export const photoSelection = pgTable(
  "photo_selection",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    selectionGroupId: uuid("selection_group_id").notNull(),
    photoId: uuid("photo_id").notNull(),
    quantity: integer("quantity").notNull(),
    note: text("note"),
    ...auditColumns(),
  },
  (t) => [
    unique("photo_selection_group_photo_uq").on(t.selectionGroupId, t.photoId),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.selectionGroupId },
      { workspaceId: selectionGroup.workspaceId, id: selectionGroup.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.photoId },
      { workspaceId: galleryPhoto.workspaceId, id: galleryPhoto.id },
    ).onDelete("restrict"),
    index("photo_selection_photo_ix").on(t.photoId),
    check("photo_selection_quantity_ck", sql`${t.quantity} > 0`),
    check(
      "photo_selection_note_ck",
      sql`${t.note} is null or char_length(${t.note}) between 1 and 500`,
    ),
  ],
);
