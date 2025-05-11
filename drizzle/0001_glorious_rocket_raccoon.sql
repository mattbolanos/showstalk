CREATE TABLE "ticket"."artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"upcoming_shows" numeric,
	"image" text,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket"."event_artists" (
	"event_id" text NOT NULL,
	"artist_id" text NOT NULL,
	CONSTRAINT "event_artists_event_id_artist_id_pk" PRIMARY KEY("event_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "ticket"."event_meta" (
	"id" text PRIMARY KEY NOT NULL,
	"local_datetime" text NOT NULL,
	"utc_datetime" text NOT NULL,
	"is_time_tbd" boolean NOT NULL,
	"name" text NOT NULL,
	"event_category" text NOT NULL,
	"venue_name" text NOT NULL,
	"venue_city" text NOT NULL,
	"venue_state" text NOT NULL,
	"venue_street_address" text NOT NULL,
	"venue_extended_address" text,
	"venue_latitude" numeric(8, 6),
	"venue_longitude" numeric(9, 6),
	"venue_timezone" text NOT NULL,
	"updated_at" text DEFAULT 'now()' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket"."event_metrics" (
	"event_id" text NOT NULL,
	"fetch_date" text NOT NULL,
	"min_price_total" numeric NOT NULL,
	"min_price_prefee" numeric NOT NULL,
	"search_score" numeric,
	"popularity_score" numeric,
	"trending_score" numeric,
	CONSTRAINT "event_metrics_event_id_fetch_date_pk" PRIMARY KEY("event_id","fetch_date")
);
--> statement-breakpoint
DROP TABLE "showstalk_post" CASCADE;--> statement-breakpoint
ALTER TABLE "ticket"."event_artists" ADD CONSTRAINT "event_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "ticket"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket"."event_artists" ADD CONSTRAINT "event_artists_event_id_event_meta_id_fk" FOREIGN KEY ("event_id") REFERENCES "ticket"."event_meta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket"."event_metrics" ADD CONSTRAINT "event_metrics_event_id_event_meta_id_fk" FOREIGN KEY ("event_id") REFERENCES "ticket"."event_meta"("id") ON DELETE no action ON UPDATE no action;