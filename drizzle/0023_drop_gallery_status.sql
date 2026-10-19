ALTER TABLE "gallery" DROP CONSTRAINT "gallery_expiry_days_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_archived_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_final_delivery_ck";--> statement-breakpoint
ALTER TABLE "gallery" DROP CONSTRAINT "gallery_archived_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "gallery" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "gallery" DROP COLUMN "expiry_days";--> statement-breakpoint
ALTER TABLE "gallery" DROP COLUMN "published_at";--> statement-breakpoint
ALTER TABLE "gallery" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "gallery" DROP COLUMN "archived_by";