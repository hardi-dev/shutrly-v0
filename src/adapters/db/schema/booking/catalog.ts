import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
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

// F-05 service catalog (BR-CAT-001…011, ADR-003, ADR-007). Templates only: F-07 snapshots them.
const nameCheck = (column: unknown) =>
  sql`char_length(${column}) between 1 and 60 and ${column} = btrim(${column})`;
const updatedBy = () => text("updated_by").references(() => user.id, { onDelete: "set null" });

export const serviceCategory = pgTable(
  "service_category",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("service_category_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    check("service_category_name_ck", nameCheck(t.name)),
  ],
);

export const serviceItemDefinition = pgTable(
  "service_item_definition",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    valueType: text("value_type").notNull(),
    unit: text("unit"),
    selectionRequired: boolean("selection_required").notNull().default(false),
    // Legacy column, dual-written from pickMode until a cleanup migration drops it (F-10 R-4).
    selectionType: text("selection_type"),
    pickMode: text("pick_mode"),
    allowsPickNotes: boolean("allows_pick_notes").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("service_item_definition_workspace_name_uq").on(
      t.workspaceId,
      sql`lower(${t.name})`,
    ),
    check("service_item_definition_name_ck", nameCheck(t.name)),
    check("service_item_definition_value_type_ck", sql`${t.valueType} in ('NUMBER','RANGE')`),
    check(
      "service_item_definition_unit_ck",
      sql`${t.unit} is null or (char_length(${t.unit}) between 1 and 20 and ${t.unit} = btrim(${t.unit}))`,
    ),
    check(
      "service_item_definition_selection_type_ck",
      sql`${t.selectionType} is null or ${t.selectionType} in ('EDIT','PRINT')`,
    ),
    check(
      "service_item_definition_pick_mode_ck",
      sql`${t.pickMode} is null or ${t.pickMode} in ('COUNT','QUANTITY')`,
    ),
    check(
      "service_item_definition_pick_ck",
      sql`${t.selectionRequired} = (${t.pickMode} is not null)`,
    ),
    check(
      "service_item_definition_pick_notes_ck",
      sql`not ${t.allowsPickNotes} or ${t.selectionRequired}`,
    ),
    check(
      "service_item_definition_selection_number_ck",
      sql`not ${t.selectionRequired} or ${t.valueType} = 'NUMBER'`,
    ),
  ],
);

export const service = pgTable(
  "service",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id").notNull(),
    name: text("name").notNull(),
    basePrice: numeric("base_price", { precision: 18, scale: 3 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.categoryId },
      { workspaceId: serviceCategory.workspaceId, id: serviceCategory.id },
    ).onDelete("restrict"),
    uniqueIndex("service_workspace_name_uq").on(t.workspaceId, sql`lower(${t.name})`),
    index("service_workspace_category_ix").on(t.workspaceId, t.categoryId),
    check("service_name_ck", nameCheck(t.name)),
    check(
      "service_base_price_ck",
      sql`${t.basePrice} >= 0 and ${t.basePrice} = trunc(${t.basePrice}) and ${t.basePrice} <= 999999999999`,
    ),
    check("service_currency_ck", sql`${t.currency} = 'IDR'`),
  ],
);

export const serviceItem = pgTable(
  "service_item",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    serviceId: uuid("service_id").notNull(),
    definitionId: uuid("definition_id").notNull(),
    value: jsonb("value").notNull(),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.serviceId },
      { workspaceId: service.workspaceId, id: service.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.definitionId },
      { workspaceId: serviceItemDefinition.workspaceId, id: serviceItemDefinition.id },
    ).onDelete("restrict"),
    unique("service_item_definition_uq").on(t.workspaceId, t.serviceId, t.definitionId),
    index("service_item_order_ix").on(t.serviceId, t.sortOrder),
    check("service_item_value_ck", sql`jsonb_typeof(${t.value}) = 'object'`),
  ],
);

export const serviceFieldDefinition = pgTable(
  "service_field_definition",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    serviceId: uuid("service_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    fieldType: text("field_type").notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    options: jsonb("options"),
    sortOrder: integer("sort_order").notNull(),
    updatedBy: updatedBy(),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.serviceId },
      { workspaceId: service.workspaceId, id: service.id },
    ).onDelete("cascade"),
    unique("service_field_key_uq").on(t.workspaceId, t.serviceId, t.key),
    uniqueIndex("service_field_name_uq").on(t.serviceId, sql`lower(${t.name})`),
    index("service_field_order_ix").on(t.serviceId, t.sortOrder),
    check("service_field_key_ck", sql`${t.key} ~ '^[a-z][a-z0-9_]{0,49}$'`),
    check("service_field_name_ck", nameCheck(t.name)),
    check(
      "service_field_type_ck",
      sql`${t.fieldType} in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')`,
    ),
    check(
      "service_field_options_ck",
      sql`(${t.fieldType} = 'SELECT') = (${t.options} is not null) and (${t.options} is null or jsonb_typeof(${t.options}) = 'array')`,
    ),
  ],
);
