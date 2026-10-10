ALTER TABLE "service_item_definition" DROP CONSTRAINT "service_item_definition_selection_ck";--> statement-breakpoint
ALTER TABLE "project_item" DROP CONSTRAINT "project_item_selection_ck";--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD COLUMN "pick_mode" text;--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD COLUMN "allows_pick_notes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_item" ADD COLUMN "pick_mode" text;--> statement-breakpoint
ALTER TABLE "project_item" ADD COLUMN "allows_pick_notes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "service_item_definition" SET "pick_mode" = CASE "selection_type" WHEN 'EDIT' THEN 'COUNT' WHEN 'PRINT' THEN 'QUANTITY' END, "allows_pick_notes" = coalesce("selection_type" = 'EDIT', false);--> statement-breakpoint
UPDATE "project_item" SET "pick_mode" = CASE "selection_type" WHEN 'EDIT' THEN 'COUNT' WHEN 'PRINT' THEN 'QUANTITY' END, "allows_pick_notes" = coalesce("selection_type" = 'EDIT', false);--> statement-breakpoint
-- Transition (F-10 R-4): branches on the shared database that still write only selection_type
-- get pick_mode derived from it, so the new checks hold. Dropped with selection_type later.
CREATE OR REPLACE FUNCTION "f10_derive_pick_mode"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW."pick_mode" IS NULL AND NEW."selection_type" IS NOT NULL)
     OR (TG_OP = 'UPDATE' AND NEW."selection_type" IS DISTINCT FROM OLD."selection_type"
         AND NEW."pick_mode" IS NOT DISTINCT FROM OLD."pick_mode") THEN
    NEW."pick_mode" := CASE NEW."selection_type" WHEN 'EDIT' THEN 'COUNT' WHEN 'PRINT' THEN 'QUANTITY' END;
    NEW."allows_pick_notes" := coalesce(NEW."selection_type" = 'EDIT', false);
  END IF;
  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE TRIGGER "service_item_definition_derive_pick_mode" BEFORE INSERT OR UPDATE ON "service_item_definition" FOR EACH ROW EXECUTE FUNCTION "f10_derive_pick_mode"();--> statement-breakpoint
CREATE TRIGGER "project_item_derive_pick_mode" BEFORE INSERT OR UPDATE ON "project_item" FOR EACH ROW EXECUTE FUNCTION "f10_derive_pick_mode"();--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_pick_mode_ck" CHECK ("service_item_definition"."pick_mode" is null or "service_item_definition"."pick_mode" in ('COUNT','QUANTITY'));--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_pick_ck" CHECK ("service_item_definition"."selection_required" = ("service_item_definition"."pick_mode" is not null));--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_pick_notes_ck" CHECK (not "service_item_definition"."allows_pick_notes" or "service_item_definition"."selection_required");--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_pick_mode_ck" CHECK ("project_item"."pick_mode" is null or "project_item"."pick_mode" in ('COUNT','QUANTITY'));--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_pick_ck" CHECK ("project_item"."selection_required" = ("project_item"."pick_mode" is not null));--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_pick_notes_ck" CHECK (not "project_item"."allows_pick_notes" or "project_item"."selection_required");
