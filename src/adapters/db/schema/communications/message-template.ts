import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn, tenantKey, workspaceIdColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";
import { workspace } from "../workspace/workspace";

// F-03 message templates: exactly one per workspace, type and channel (BR-MSG-002, AC-MSG-003).
export const messageTemplate = pgTable(
  "message_template",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    type: text("type").notNull(),
    channel: text("channel").notNull().default("WHATSAPP"),
    content: text("content").notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    uniqueIndex("message_template_workspace_type_channel_uq").on(t.workspaceId, t.type, t.channel),
    check(
      "message_template_type_ck",
      sql`${t.type} in ('GALLERY_SHARE','SELECTION_REMINDER','FINAL_DELIVERY','INVOICE_SHARE','PAYMENT_REMINDER')`,
    ),
    check("message_template_channel_ck", sql`${t.channel} = 'WHATSAPP'`),
    check("message_template_content_ck", sql`char_length(${t.content}) between 1 and 2000`),
  ],
);
