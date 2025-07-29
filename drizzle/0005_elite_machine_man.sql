DROP INDEX "ticket"."artists_raw_slug_idx";--> statement-breakpoint
ALTER TABLE "ticket"."artists" DROP COLUMN "raw_slug";