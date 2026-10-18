ALTER TABLE "gallery" DROP CONSTRAINT "gallery_status_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_expiry_one_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_expiry_days_draft_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_published_ck";--> statement-breakpoint
ALTER TABLE "gallery" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gallery" ALTER COLUMN "status" DROP NOT NULL;