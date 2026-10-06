import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  auditColumns,
  idColumn,
  tenantKey,
  tenantRef,
  workspaceIdColumn,
} from "../_conventions/tenant";
import { user } from "../auth/auth";
import { selectionGroup } from "../gallery/selection";
import { project } from "./project";

// F-10 project add-ons (BR-ADD-001…006, TD D-16). Money is exact whole IDR in numeric(18,3)
// (ADR-007). No invoice line until F-14 (FC-001); the price stays on the add-on.
export const projectAddOn = pgTable(
  "project_add_on",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    selectionGroupId: uuid("selection_group_id"),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 18, scale: 3 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 18, scale: 3 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    status: text("status").notNull().default("DRAFT"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by").references(() => user.id, { onDelete: "set null" }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.selectionGroupId },
      { workspaceId: selectionGroup.workspaceId, id: selectionGroup.id },
      // `no action`, not `restrict`: checked at statement end, so a project or gallery cascade that
      // removes both the group and its add-ons doesn't fail on ordering. A direct delete still fails.
    ).onDelete("no action"),
    index("project_add_on_project_ix").on(t.projectId, t.createdAt),
    check(
      "project_add_on_description_ck",
      sql`char_length(${t.description}) between 1 and 100 and ${t.description} = btrim(${t.description})`,
    ),
    check("project_add_on_quantity_ck", sql`${t.quantity} >= 1`),
    check(
      "project_add_on_unit_price_ck",
      sql`${t.unitPrice} >= 0 and ${t.unitPrice} = trunc(${t.unitPrice})`,
    ),
    check("project_add_on_total_ck", sql`${t.totalAmount} = ${t.quantity} * ${t.unitPrice}`),
    check("project_add_on_currency_ck", sql`${t.currency} = 'IDR'`),
    check("project_add_on_status_ck", sql`${t.status} in ('DRAFT','APPROVED','CANCELLED')`),
    check(
      "project_add_on_cancelled_ck",
      sql`(${t.status} = 'CANCELLED') = (${t.cancelledAt} is not null)`,
    ),
    check(
      "project_add_on_approved_ck",
      sql`${t.status} in ('DRAFT','CANCELLED') or ${t.approvedAt} is not null`,
    ),
    check("project_add_on_draft_ck", sql`${t.status} <> 'DRAFT' or ${t.approvedAt} is null`),
  ],
);
