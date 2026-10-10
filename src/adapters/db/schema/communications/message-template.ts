import { sql } from "drizzle-orm";
import { boolean, check, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

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
    // Null for a platform default: the EN/ID text is rendered in code (BR-L10N-003, D-12).
    content: text("content"),
    // Whether this row still is the platform default. Written explicitly by the save modes (D-13).
    isDefault: boolean("is_default").notNull().default(false),
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
    check(
      "message_template_content_ck",
      sql`${t.content} is null or char_length(${t.content}) between 1 and 2000`,
    ),
    check("message_template_custom_content_ck", sql`${t.isDefault} or ${t.content} is not null`),
  ],
);
