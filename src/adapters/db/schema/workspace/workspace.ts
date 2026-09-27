import { desc, sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { auditColumns, idColumn } from "../_conventions/tenant";
import { user } from "../auth/auth";

export const workspace = pgTable(
  "workspace",
  {
    id: idColumn(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    brandName: text("brand_name"),
    contactEmail: text("contact_email"),
    phone: text("phone"),
    address: text("address"),
    invoicePrefix: text("invoice_prefix").notNull(),
    currency: text("currency").notNull().default("IDR"),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }).notNull().defaultNow(),
    ...auditColumns(),
  },
  (t) => [
    uniqueIndex("workspace_owner_name_uq").on(t.ownerUserId, sql`lower(${t.name})`),
    index("workspace_owner_last_opened_ix").on(t.ownerUserId, desc(t.lastOpenedAt)),
    check("workspace_name_ck", sql`char_length(${t.name}) between 1 and 60`),
    check(
      "workspace_brand_name_ck",
      sql`${t.brandName} is null or char_length(${t.brandName}) <= 80`,
    ),
    check(
      "workspace_contact_email_ck",
      sql`${t.contactEmail} is null or char_length(${t.contactEmail}) <= 254`,
    ),
    check("workspace_phone_ck", sql`${t.phone} is null or ${t.phone} ~ '^[0-9 +()\\-]{8,20}$'`),
    check("workspace_address_ck", sql`${t.address} is null or char_length(${t.address}) <= 300`),
    check("workspace_invoice_prefix_ck", sql`${t.invoicePrefix} ~ '^[A-Z0-9]{2,6}$'`),
    check("workspace_currency_ck", sql`${t.currency} = 'IDR'`),
  ],
);
