CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"password_ciphertext" text NOT NULL,
	"password_iv" text NOT NULL,
	"password_key_version" integer DEFAULT 1 NOT NULL,
	"password_hash" text NOT NULL,
	"password_version" integer DEFAULT 1 NOT NULL,
	"password_changed_at" timestamp with time zone,
	"password_changed_by" text,
	"expires_at" timestamp with time zone,
	"expiry_days" integer,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"archived_by" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "gallery_project_uq" UNIQUE("project_id"),
	CONSTRAINT "gallery_status_ck" CHECK ("gallery"."status" in ('DRAFT','PUBLISHED','ARCHIVED')),
	CONSTRAINT "gallery_password_version_ck" CHECK ("gallery"."password_version" >= 1),
	CONSTRAINT "gallery_expiry_days_ck" CHECK ("gallery"."expiry_days" is null or "gallery"."expiry_days" between 1 and 3650),
	CONSTRAINT "gallery_expiry_one_ck" CHECK (not ("gallery"."expires_at" is not null and "gallery"."expiry_days" is not null)),
	CONSTRAINT "gallery_expiry_days_draft_ck" CHECK ("gallery"."expiry_days" is null or "gallery"."status" = 'DRAFT'),
	CONSTRAINT "gallery_published_ck" CHECK (("gallery"."status" = 'DRAFT') = ("gallery"."published_at" is null)),
	CONSTRAINT "gallery_archived_ck" CHECK (("gallery"."status" = 'ARCHIVED') = ("gallery"."archived_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "gallery_photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"gallery_id" uuid NOT NULL,
	"gallery_source_id" uuid NOT NULL,
	"external_file_id" text NOT NULL,
	"resource_key" text,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"name_sort_key" text NOT NULL,
	"kind" text NOT NULL,
	"folder_path" text DEFAULT '' NOT NULL,
	"browse_path" text DEFAULT '' NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"missing_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_photo_file_uq" UNIQUE("gallery_source_id","external_file_id"),
	CONSTRAINT "gallery_photo_kind_ck" CHECK ("gallery_photo"."kind" in ('PROOF','EDITED','PRINT'))
);
--> statement-breakpoint
CREATE TABLE "gallery_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"gallery_id" uuid NOT NULL,
	"workspace_source_id" uuid NOT NULL,
	"provider_folder_id" text NOT NULL,
	"resource_key" text,
	"label" text,
	"folder_name" text,
	"removed_at" timestamp with time zone,
	"removed_by" text,
	"sync_status" text DEFAULT 'NEVER' NOT NULL,
	"sync_started_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"last_sync_attempt_at" timestamp with time zone,
	"sync_error_code" text,
	"proof_count" integer DEFAULT 0 NOT NULL,
	"edited_count" integer DEFAULT 0 NOT NULL,
	"print_count" integer DEFAULT 0 NOT NULL,
	"ignored_count" integer DEFAULT 0 NOT NULL,
	"missing_count" integer DEFAULT 0 NOT NULL,
	"too_deep_count" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_source_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "gallery_source_folder_ck" CHECK ("gallery_source"."provider_folder_id" ~ '^[A-Za-z0-9_-]{10,200}$'),
	CONSTRAINT "gallery_source_label_ck" CHECK ("gallery_source"."label" is null or (char_length("gallery_source"."label") between 1 and 60 and "gallery_source"."label" = btrim("gallery_source"."label"))),
	CONSTRAINT "gallery_source_sync_status_ck" CHECK ("gallery_source"."sync_status" in ('NEVER','SYNCING','SUCCEEDED','FAILED')),
	CONSTRAINT "gallery_source_sync_error_ck" CHECK ("gallery_source"."sync_error_code" is null or "gallery_source"."sync_error_code" in ('NOT_PUBLIC','RATE_LIMITED','UNAVAILABLE','TOO_LARGE'))
);
--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_password_changed_by_user_id_fk" FOREIGN KEY ("password_changed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photo" ADD CONSTRAINT "gallery_photo_workspace_id_gallery_id_gallery_workspace_id_id_fk" FOREIGN KEY ("workspace_id","gallery_id") REFERENCES "public"."gallery"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photo" ADD CONSTRAINT "gallery_photo_workspace_id_gallery_source_id_gallery_source_workspace_id_id_fk" FOREIGN KEY ("workspace_id","gallery_source_id") REFERENCES "public"."gallery_source"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD CONSTRAINT "gallery_source_removed_by_user_id_fk" FOREIGN KEY ("removed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD CONSTRAINT "gallery_source_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD CONSTRAINT "gallery_source_workspace_id_gallery_id_gallery_workspace_id_id_fk" FOREIGN KEY ("workspace_id","gallery_id") REFERENCES "public"."gallery"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD CONSTRAINT "gallery_source_workspace_id_workspace_source_id_workspace_source_config_workspace_id_id_fk" FOREIGN KEY ("workspace_id","workspace_source_id") REFERENCES "public"."workspace_source_config"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_photo_browse_ix" ON "gallery_photo" USING btree ("gallery_id","kind","gallery_source_id","browse_path","name_sort_key","id");--> statement-breakpoint
CREATE INDEX "gallery_photo_name_ix" ON "gallery_photo" USING btree ("gallery_id","name_sort_key","id");--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_source_folder_uq" ON "gallery_source" USING btree ("gallery_id","provider_folder_id") WHERE "gallery_source"."removed_at" is null;--> statement-breakpoint
CREATE INDEX "gallery_source_workspace_folder_ix" ON "gallery_source" USING btree ("workspace_id","provider_folder_id");