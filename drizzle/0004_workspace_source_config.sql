CREATE TABLE "workspace_source_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"display_name" text NOT NULL,
	"config_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_source_config_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "workspace_source_config_provider_ck" CHECK ("workspace_source_config"."provider" in ('GOOGLE_DRIVE')),
	CONSTRAINT "workspace_source_config_name_ck" CHECK (char_length("workspace_source_config"."display_name") between 1 and 60 and "workspace_source_config"."display_name" = btrim("workspace_source_config"."display_name")),
	CONSTRAINT "workspace_source_config_config_ck" CHECK (jsonb_typeof("workspace_source_config"."config_data") = 'object')
);
--> statement-breakpoint
ALTER TABLE "workspace_source_config" ADD CONSTRAINT "workspace_source_config_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_source_config" ADD CONSTRAINT "workspace_source_config_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_source_config_workspace_name_uq" ON "workspace_source_config" USING btree ("workspace_id",lower("display_name"));