CREATE TABLE "gallery_folder_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"gallery_source_id" uuid NOT NULL,
	"folder_path" text NOT NULL,
	"project_item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_folder_map_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "gallery_folder_map_path_uq" UNIQUE("gallery_source_id","folder_path")
);
--> statement-breakpoint
ALTER TABLE "gallery_photo" ADD COLUMN "project_item_id" uuid;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD COLUMN "known_folders" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_folder_map" ADD CONSTRAINT "gallery_folder_map_workspace_id_gallery_source_id_gallery_source_workspace_id_id_fk" FOREIGN KEY ("workspace_id","gallery_source_id") REFERENCES "public"."gallery_source"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_folder_map" ADD CONSTRAINT "gallery_folder_map_workspace_id_project_item_id_project_item_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_item_id") REFERENCES "public"."project_item"("workspace_id","id") ON DELETE cascade ON UPDATE no action;