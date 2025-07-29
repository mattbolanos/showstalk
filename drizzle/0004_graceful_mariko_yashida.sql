ALTER TABLE "ticket"."artists" ADD COLUMN "raw_slug" text;--> statement-breakpoint
CREATE INDEX "artists_raw_slug_idx" ON "ticket"."artists" USING btree ("raw_slug");