import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-06 clients (BR-CLI-001…003, ADR-003). Social links are Zod-validated JSONB (TD D-2).
export const client = pgTable(
  "client",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    whatsappNumber: text("whatsapp_number"),
    socialLinks: jsonb("social_links")
      .notNull()
      .default(sql`'[]'::jsonb`),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (table) => [
    tenantKey(table),
    uniqueIndex("client_workspace_whatsapp_uq").on(table.workspaceId, table.whatsappNumber),
    index("client_workspace_list_idx").on(
      table.workspaceId,
      sql`lower(${table.name})`,
      table.createdAt,
      table.id,
    ),
    check(
      "client_name_ck",
      sql`char_length(${table.name}) between 1 and 100 and ${table.name} = btrim(${table.name})`,
    ),
    check(
      "client_whatsapp_number_ck",
      sql`${table.whatsappNumber} is null or (${table.whatsappNumber} ~ '^[1-9][0-9]{9,14}$' and ${table.whatsappNumber} !~ '^620')`,
    ),
    check(
      "client_social_links_ck",
      sql`jsonb_typeof(${table.socialLinks}) = 'array' and jsonb_array_length(${table.socialLinks}) <= 10`,
    ),
  ],
);
