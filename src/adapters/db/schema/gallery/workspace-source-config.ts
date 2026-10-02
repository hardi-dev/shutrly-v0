import { sql } from "drizzle-orm";
import { boolean, check, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-04 photo sources (BR-SRC-005/006). F-09's gallery_source references (workspace_id, id) with RESTRICT.
export const workspaceSourceConfig = pgTable(
  "workspace_source_config",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    provider: text("provider").notNull(),
    displayName: text("display_name").notNull(),
    configData: jsonb("config_data").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("workspace_source_config_workspace_name_uq").on(
      t.workspaceId,
      sql`lower(${t.displayName})`,
    ),
    check("workspace_source_config_provider_ck", sql`${t.provider} in ('GOOGLE_DRIVE')`),
    check(
      "workspace_source_config_name_ck",
      sql`char_length(${t.displayName}) between 1 and 60 and ${t.displayName} = btrim(${t.displayName})`,
    ),
    check("workspace_source_config_config_ck", sql`jsonb_typeof(${t.configData}) = 'object'`),
  ],
);
