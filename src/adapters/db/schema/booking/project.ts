import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
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
import { workspace } from "../workspace/workspace";
import { service, serviceItemDefinition } from "./catalog";
import { client } from "./client";

// F-07 projects (BR-PRJ-001…010, ADR-003). Package items, booking values and sessions are
// snapshots owned by the project (TD D-4, D-5). `client_access_token` is write-once (TD D-6).
export const project = pgTable(
  "project",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    clientId: uuid("client_id").notNull(),
    serviceId: uuid("service_id").notNull(),
    title: text("title").notNull(),
    notes: text("notes"),
    agreedPrice: numeric("agreed_price", { precision: 18, scale: 3 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    status: text("status").notNull(),
    clientAccessToken: text("client_access_token").notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by").references(() => user.id, { onDelete: "set null" }),
    cancelReason: text("cancel_reason"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.clientId },
      { workspaceId: client.workspaceId, id: client.id },
    ).onDelete("restrict"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.serviceId },
      { workspaceId: service.workspaceId, id: service.id },
    ).onDelete("restrict"),
    uniqueIndex("project_access_token_uq").on(t.clientAccessToken),
    index("project_workspace_status_ix").on(t.workspaceId, t.status, t.createdAt),
    index("project_workspace_client_ix").on(t.workspaceId, t.clientId),
    index("project_workspace_service_ix").on(t.workspaceId, t.serviceId),
    check(
      "project_title_ck",
      sql`char_length(${t.title}) between 1 and 100 and ${t.title} = btrim(${t.title})`,
    ),
    check("project_notes_ck", sql`${t.notes} is null or char_length(${t.notes}) <= 2000`),
    check(
      "project_price_ck",
      sql`${t.agreedPrice} >= 0 and ${t.agreedPrice} = trunc(${t.agreedPrice}) and ${t.agreedPrice} <= 999999999999`,
    ),
    check("project_currency_ck", sql`${t.currency} = 'IDR'`),
    check(
      "project_status_ck",
      sql`${t.status} in ('DRAFT','BOOKED','SHOOTING','POST_PROCESSING','DELIVERED','COMPLETED','CANCELLED')`,
    ),
    check("project_token_ck", sql`${t.clientAccessToken} ~ '^[A-Za-z0-9_-]{43}$'`),
    check("project_cancel_ck", sql`(${t.status} = 'CANCELLED') = (${t.cancelledAt} is not null)`),
    check(
      "project_cancel_reason_ck",
      sql`${t.cancelReason} is null or char_length(${t.cancelReason}) <= 500`,
    ),
  ],
);

export const projectItem = pgTable(
  "project_item",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    definitionId: uuid("definition_id").notNull(),
    name: text("name").notNull(),
    valueType: text("value_type").notNull(),
    value: jsonb("value").notNull(),
    unit: text("unit"),
    selectionRequired: boolean("selection_required").notNull(),
    selectionType: text("selection_type"),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.definitionId },
      { workspaceId: serviceItemDefinition.workspaceId, id: serviceItemDefinition.id },
    ).onDelete("restrict"),
    unique("project_item_definition_uq").on(t.workspaceId, t.projectId, t.definitionId),
    index("project_item_order_ix").on(t.projectId, t.sortOrder),
    check("project_item_value_type_ck", sql`${t.valueType} in ('NUMBER','RANGE')`),
    check("project_item_value_ck", sql`jsonb_typeof(${t.value}) = 'object'`),
    check(
      "project_item_selection_ck",
      sql`${t.selectionRequired} = (${t.selectionType} is not null)`,
    ),
    check(
      "project_item_selection_type_ck",
      sql`${t.selectionType} is null or ${t.selectionType} in ('EDIT','PRINT')`,
    ),
    check(
      "project_item_selection_number_ck",
      sql`not ${t.selectionRequired} or ${t.valueType} = 'NUMBER'`,
    ),
  ],
);

export const projectFieldValue = pgTable(
  "project_field_value",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    fieldKey: text("field_key").notNull(),
    fieldName: text("field_name").notNull(),
    fieldType: text("field_type").notNull(),
    isRequired: boolean("is_required").notNull(),
    options: jsonb("options"),
    value: jsonb("value"),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("cascade"),
    unique("project_field_value_key_uq").on(t.projectId, t.fieldKey),
    check(
      "project_field_value_type_ck",
      sql`${t.fieldType} in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')`,
    ),
    check(
      "project_field_value_options_ck",
      sql`(${t.fieldType} = 'SELECT') = (${t.options} is not null)`,
    ),
  ],
);

export const projectSession = pgTable(
  "project_session",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    projectId: uuid("project_id").notNull(),
    name: text("name").notNull(),
    sessionDate: date("session_date", { mode: "string" }).notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    location: text("location"),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("cascade"),
    index("project_session_order_ix").on(t.projectId, t.sessionDate, t.startTime, t.createdAt),
    check(
      "project_session_name_ck",
      sql`char_length(${t.name}) between 1 and 100 and ${t.name} = btrim(${t.name})`,
    ),
    check(
      "project_session_location_ck",
      sql`${t.location} is null or char_length(${t.location}) <= 200`,
    ),
    check(
      "project_session_time_ck",
      sql`${t.endTime} is null or (${t.startTime} is not null and ${t.endTime} > ${t.startTime})`,
    ),
  ],
);
