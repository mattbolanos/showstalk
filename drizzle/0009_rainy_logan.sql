ALTER TABLE "ticket"."event_artists" DROP CONSTRAINT "event_artists_artist_id_artists_ticketmaster_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "ticket"."event_artists" ADD CONSTRAINT "event_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "ticket"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket"."artists" DROP COLUMN "ticketmaster_id";