CREATE TABLE "photo_selection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"selection_group_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_selection_group_photo_uq" UNIQUE("selection_group_id","photo_id"),
	CONSTRAINT "photo_selection_quantity_ck" CHECK ("photo_selection"."quantity" > 0),
	CONSTRAINT "photo_selection_note_ck" CHECK ("photo_selection"."note" is null or char_length("photo_selection"."note") between 1 and 500)
);--> statement-breakpoint
CREATE TABLE "selection_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"project_item_id" uuid NOT NULL,
	"gallery_id" uuid NOT NULL,
	"base_limit" integer NOT NULL,
	"extra_limit" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"submitted_at" timestamp with time zone,
	"locked_at" timestamp with time zone,
	"locked_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "selection_group_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "selection_group_item_uq" UNIQUE("project_item_id"),
	CONSTRAINT "selection_group_base_limit_ck" CHECK ("selection_group"."base_limit" >= 0),
	CONSTRAINT "selection_group_extra_limit_ck" CHECK ("selection_group"."extra_limit" >= 0),
	CONSTRAINT "selection_group_status_ck" CHECK ("selection_group"."status" in ('OPEN','SUBMITTED','LOCKED')),
	CONSTRAINT "selection_group_locked_ck" CHECK (("selection_group"."status" = 'LOCKED') = ("selection_group"."locked_at" is not null))
);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "completed_by" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "token_rotated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "token_rotated_by" text;--> statement-breakpoint
ALTER TABLE "gallery" ADD COLUMN "final_delivery_published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gallery" ADD COLUMN "final_delivery_published_by" text;--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_workspace_id_id_unique" UNIQUE("workspace_id","id");--> statement-breakpoint
ALTER TABLE "gallery_photo" ADD CONSTRAINT "gallery_photo_workspace_id_id_unique" UNIQUE("workspace_id","id");--> statement-breakpoint
ALTER TABLE "photo_selection" ADD CONSTRAINT "photo_selection_workspace_id_selection_group_id_selection_group_workspace_id_id_fk" FOREIGN KEY ("workspace_id","selection_group_id") REFERENCES "public"."selection_group"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_selection" ADD CONSTRAINT "photo_selection_workspace_id_photo_id_gallery_photo_workspace_id_id_fk" FOREIGN KEY ("workspace_id","photo_id") REFERENCES "public"."gallery_photo"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_group" ADD CONSTRAINT "selection_group_locked_by_user_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_group" ADD CONSTRAINT "selection_group_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_group" ADD CONSTRAINT "selection_group_workspace_id_project_item_id_project_item_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_item_id") REFERENCES "public"."project_item"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_group" ADD CONSTRAINT "selection_group_workspace_id_gallery_id_gallery_workspace_id_id_fk" FOREIGN KEY ("workspace_id","gallery_id") REFERENCES "public"."gallery"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "photo_selection_photo_ix" ON "photo_selection" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "selection_group_project_ix" ON "selection_group" USING btree ("project_id");--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_token_rotated_by_user_id_fk" FOREIGN KEY ("token_rotated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_final_delivery_published_by_user_id_fk" FOREIGN KEY ("final_delivery_published_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- A-23: galleries already published get one OPEN group per selection item.
INSERT INTO "selection_group" ("workspace_id", "project_id", "project_item_id", "gallery_id", "base_limit")
SELECT pi."workspace_id", pi."project_id", pi."id", g."id",
       CASE WHEN pi."value"->>'type' = 'NUMBER' THEN floor((pi."value"->>'value')::numeric)::int ELSE 0 END
FROM "project_item" pi
JOIN "gallery" g ON g."workspace_id" = pi."workspace_id" AND g."project_id" = pi."project_id"
WHERE pi."selection_required" AND g."status" = 'PUBLISHED'
ON CONFLICT ("project_item_id") DO NOTHING;--> statement-breakpoint
UPDATE "project" SET "completed_at" = "updated_at" WHERE "status" = 'COMPLETED' AND "completed_at" IS NULL;--> statement-breakpoint
-- Transition: branches on the shared database that move a project to COMPLETED without
-- completed_at (fixtures, older code) get it filled, so project_completed_ck holds.
CREATE OR REPLACE FUNCTION "f10_fill_completed_at"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."status" = 'COMPLETED' AND NEW."completed_at" IS NULL THEN
    NEW."completed_at" := now();
  END IF;
  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE TRIGGER "project_fill_completed_at" BEFORE INSERT OR UPDATE ON "project" FOR EACH ROW EXECUTE FUNCTION "f10_fill_completed_at"();--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_completed_ck" CHECK (("project"."status" = 'COMPLETED') = ("project"."completed_at" is not null));--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_final_delivery_ck" CHECK ("gallery"."final_delivery_published_at" is null or "gallery"."status" <> 'DRAFT');
