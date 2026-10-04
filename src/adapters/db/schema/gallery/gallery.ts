import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
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
import { project } from "../booking/project";
import { workspace } from "../workspace/workspace";
import { workspaceSourceConfig } from "./workspace-source-config";

// F-09 galleries (BR-GAL-001…009, ADR-005, ADR-017, TD D-1…D-3). EXPIRED is derived from
// `expires_at` when read, never stored. The password is AES-256-GCM ciphertext plus a hash.
export const gallery = pgTable(
  "gallery",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn().references(() => workspace.id, { onDelete: "restrict" }),
    projectId: uuid("project_id").notNull(),
    status: text("status").notNull().default("DRAFT"),
    passwordCiphertext: text("password_ciphertext").notNull(),
    passwordIv: text("password_iv").notNull(),
    passwordKeyVersion: integer("password_key_version").notNull().default(1),
    passwordHash: text("password_hash").notNull(),
    passwordVersion: integer("password_version").notNull().default(1),
    // ADR-019 point 5, TD D-24: bumped by every change a client could see; F-10 keys its cache on it.
    contentVersion: integer("content_version").notNull().default(1),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    passwordChangedBy: text("password_changed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    expiryDays: integer("expiry_days"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by").references(() => user.id, { onDelete: "set null" }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.projectId },
      { workspaceId: project.workspaceId, id: project.id },
    ).onDelete("restrict"),
    unique("gallery_project_uq").on(t.projectId),
    check("gallery_status_ck", sql`${t.status} in ('DRAFT','PUBLISHED','ARCHIVED')`),
    check("gallery_password_version_ck", sql`${t.passwordVersion} >= 1`),
    check("gallery_content_version_ck", sql`${t.contentVersion} >= 1`),
    check(
      "gallery_expiry_days_ck",
      sql`${t.expiryDays} is null or ${t.expiryDays} between 1 and 3650`,
    ),
    check(
      "gallery_expiry_one_ck",
      sql`not (${t.expiresAt} is not null and ${t.expiryDays} is not null)`,
    ),
    check("gallery_expiry_days_draft_ck", sql`${t.expiryDays} is null or ${t.status} = 'DRAFT'`),
    check("gallery_published_ck", sql`(${t.status} = 'DRAFT') = (${t.publishedAt} is null)`),
    check("gallery_archived_ck", sql`(${t.status} = 'ARCHIVED') = (${t.archivedAt} is not null)`),
  ],
);

export const gallerySource = pgTable(
  "gallery_source",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    galleryId: uuid("gallery_id").notNull(),
    workspaceSourceId: uuid("workspace_source_id").notNull(),
    providerFolderId: text("provider_folder_id").notNull(),
    resourceKey: text("resource_key"),
    label: text("label"),
    folderName: text("folder_name"),
    removedAt: timestamp("removed_at", { withTimezone: true }),
    removedBy: text("removed_by").references(() => user.id, { onDelete: "set null" }),
    syncStatus: text("sync_status").notNull().default("NEVER"),
    syncStartedAt: timestamp("sync_started_at", { withTimezone: true }),
    // TD D-8, D-20: the open run's lease and the rest of its walk; both are null between runs.
    syncLeaseAt: timestamp("sync_lease_at", { withTimezone: true }),
    syncCursor: jsonb("sync_cursor"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastSyncAttemptAt: timestamp("last_sync_attempt_at", { withTimezone: true }),
    syncErrorCode: text("sync_error_code"),
    proofCount: integer("proof_count").notNull().default(0),
    editedCount: integer("edited_count").notNull().default(0),
    printCount: integer("print_count").notNull().default(0),
    ignoredCount: integer("ignored_count").notNull().default(0),
    missingCount: integer("missing_count").notNull().default(0),
    tooDeepCount: integer("too_deep_count").notNull().default(0),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns(),
  },
  (t) => [
    tenantKey(t),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.galleryId },
      { workspaceId: gallery.workspaceId, id: gallery.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.workspaceSourceId },
      { workspaceId: workspaceSourceConfig.workspaceId, id: workspaceSourceConfig.id },
    ).onDelete("restrict"),
    uniqueIndex("gallery_source_folder_uq")
      .on(t.galleryId, t.providerFolderId)
      .where(sql`${t.removedAt} is null`),
    index("gallery_source_workspace_folder_ix").on(t.workspaceId, t.providerFolderId),
    check("gallery_source_folder_ck", sql`${t.providerFolderId} ~ '^[A-Za-z0-9_-]{10,200}$'`),
    check(
      "gallery_source_label_ck",
      sql`${t.label} is null or (char_length(${t.label}) between 1 and 60 and ${t.label} = btrim(${t.label}))`,
    ),
    check(
      "gallery_source_sync_status_ck",
      sql`${t.syncStatus} in ('NEVER','SYNCING','SUCCEEDED','FAILED')`,
    ),
    check(
      "gallery_source_sync_error_ck",
      sql`${t.syncErrorCode} is null or ${t.syncErrorCode} in ('NOT_PUBLIC','RATE_LIMITED','UNAVAILABLE','TOO_LARGE')`,
    ),
  ],
);

export const galleryPhoto = pgTable(
  "gallery_photo",
  {
    id: idColumn(),
    workspaceId: workspaceIdColumn(),
    galleryId: uuid("gallery_id").notNull(),
    gallerySourceId: uuid("gallery_source_id").notNull(),
    externalFileId: text("external_file_id").notNull(),
    resourceKey: text("resource_key"),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    nameSortKey: text("name_sort_key").notNull(),
    kind: text("kind").notNull(),
    folderPath: text("folder_path").notNull().default(""),
    browsePath: text("browse_path").notNull().default(""),
    // Superseded by the run's `seen` list (TD D-21); the column goes in the migration that replaces the sync writes.
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    missingAt: timestamp("missing_at", { withTimezone: true }),
    ...auditColumns(),
  },
  (t) => [
    tenantRef(
      { workspaceId: t.workspaceId, column: t.galleryId },
      { workspaceId: gallery.workspaceId, id: gallery.id },
    ).onDelete("cascade"),
    tenantRef(
      { workspaceId: t.workspaceId, column: t.gallerySourceId },
      { workspaceId: gallerySource.workspaceId, id: gallerySource.id },
    ).onDelete("cascade"),
    unique("gallery_photo_file_uq").on(t.gallerySourceId, t.externalFileId),
    index("gallery_photo_browse_ix").on(
      t.galleryId,
      t.kind,
      t.gallerySourceId,
      t.browsePath,
      t.nameSortKey,
      t.id,
    ),
    index("gallery_photo_name_ix").on(t.galleryId, t.nameSortKey, t.id),
    check("gallery_photo_kind_ck", sql`${t.kind} in ('PROOF','EDITED','PRINT')`),
  ],
);
