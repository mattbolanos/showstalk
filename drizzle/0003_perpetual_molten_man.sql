ALTER TABLE "ticket"."event_metrics" ALTER COLUMN "min_price_total" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "ticket"."event_metrics" ALTER COLUMN "min_price_prefee" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "genre" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "subgenre" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "link_instagram" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "link_spotify" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "link_itunes" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "link_twitter" text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "link_musicbrainz" text;--> statement-breakpoint
CREATE INDEX "artists_name_idx" ON "ticket"."artists" USING btree ("name");--> statement-breakpoint
CREATE INDEX "artists_slug_idx" ON "ticket"."artists" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_meta_name_idx" ON "ticket"."event_meta" USING btree ("name");--> statement-breakpoint
CREATE INDEX "event_meta_venue_name_idx" ON "ticket"."event_meta" USING btree ("venue_name");--> statement-breakpoint
CREATE INDEX "event_meta_venue_city_idx" ON "ticket"."event_meta" USING btree ("venue_city");--> statement-breakpoint
CREATE INDEX "event_meta_venue_state_idx" ON "ticket"."event_meta" USING btree ("venue_state");