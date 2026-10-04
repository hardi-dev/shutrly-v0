ALTER TABLE "gallery_photo" ALTER COLUMN "last_seen_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gallery" ADD COLUMN "content_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD COLUMN "sync_lease_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gallery_source" ADD COLUMN "sync_cursor" jsonb;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_content_version_ck" CHECK ("gallery"."content_version" >= 1);