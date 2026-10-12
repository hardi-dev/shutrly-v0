ALTER TABLE "service_item_definition" ADD COLUMN "default_key" text;--> statement-breakpoint
ALTER TABLE "project_item" ADD COLUMN "default_key" text;--> statement-breakpoint
ALTER TABLE "team_role" ADD COLUMN "default_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "service_item_definition_workspace_default_key_uq" ON "service_item_definition" USING btree ("workspace_id","default_key") WHERE "service_item_definition"."default_key" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "team_role_workspace_default_key_uq" ON "team_role" USING btree ("workspace_id","default_key") WHERE "team_role"."default_key" is not null;--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_default_key_ck" CHECK ("service_item_definition"."default_key" is null or "service_item_definition"."default_key" in ('EDITED_PHOTOS','PRINTED_PHOTOS','PEOPLE_COUNT','SHOOT_DURATION'));--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_default_key_ck" CHECK ("project_item"."default_key" is null or "project_item"."default_key" in ('EDITED_PHOTOS','PRINTED_PHOTOS','PEOPLE_COUNT','SHOOT_DURATION'));--> statement-breakpoint
ALTER TABLE "team_role" ADD CONSTRAINT "team_role_default_key_ck" CHECK ("team_role"."default_key" is null or "team_role"."default_key" in ('PHOTOGRAPHER','VIDEOGRAPHER','ASSISTANT'));

-- Backfill (D-18): flag only the untouched seed rows, matched by exact name and unit (or name for roles).
-- Owner renames keep no key. Historical migrations 0007 and 0011 are not edited.
UPDATE "service_item_definition" AS d SET "default_key" = m."key"
FROM (VALUES
  ('Foto edit','foto','EDITED_PHOTOS'),
  ('Foto cetak','lembar','PRINTED_PHOTOS'),
  ('Jumlah orang','orang','PEOPLE_COUNT'),
  ('Durasi pemotretan','jam','SHOOT_DURATION')
) AS m("name","unit","key")
WHERE d."name" = m."name" AND d."unit" IS NOT DISTINCT FROM m."unit";--> statement-breakpoint
UPDATE "team_role" AS r SET "default_key" = m."key"
FROM (VALUES ('Fotografer','PHOTOGRAPHER'), ('Videografer','VIDEOGRAPHER'), ('Asisten','ASSISTANT')) AS m("name","key")
WHERE r."name" = m."name";--> statement-breakpoint
UPDATE "project_item" AS p SET "default_key" = d."default_key"
FROM "service_item_definition" AS d
WHERE p."definition_id" = d."id" AND p."workspace_id" = d."workspace_id"
  AND d."default_key" IS NOT NULL AND p."name" = d."name" AND p."unit" IS NOT DISTINCT FROM d."unit";
