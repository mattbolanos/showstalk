ALTER TABLE "ticket"."event_artists" DROP CONSTRAINT "event_artists_artist_id_artists_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'ticket'
                AND table_name = 'artists'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "artists" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "ticket"."artists" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ticket"."artists" ADD COLUMN "ticketmaster_id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket"."event_artists" ADD CONSTRAINT "event_artists_artist_id_artists_ticketmaster_id_fk" FOREIGN KEY ("artist_id") REFERENCES "ticket"."artists"("ticketmaster_id") ON DELETE no action ON UPDATE no action;