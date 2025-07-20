// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  text,
  pgSchema,
  serial,
  numeric,
  foreignKey,
  primaryKey,
  boolean,
  index,
  integer,
} from "drizzle-orm/pg-core";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

const ticketSchema = pgSchema("ticket");

export const artists = ticketSchema.table("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  upcoming_shows: numeric("upcoming_shows"),
  image: text("image"),
  slug: text("slug").notNull(),
});

export const eventMeta = ticketSchema.table("event_meta", {
  id: text("id").primaryKey(),
  localDatetime: text("local_datetime").notNull(),
  utcDatetime: text("utc_datetime").notNull(),
  isTimeTbd: boolean("is_time_tbd").notNull(),
  name: text("name").notNull(),
  eventCategory: text("event_category").notNull(),
  venueName: text("venue_name").notNull(),
  venueCity: text("venue_city").notNull(),
  venueState: text("venue_state").notNull(),
  venueStreetAddress: text("venue_street_address").notNull(),
  venueExtendedAddress: text("venue_extended_address"),
  venueLatitude: numeric("venue_latitude", { precision: 8, scale: 6 }),
  venueLongitude: numeric("venue_longitude", { precision: 9, scale: 6 }),
  venueTimezone: text("venue_timezone").notNull(),
  updatedAt: text("updated_at").notNull().default("now()"),
});

export const eventArtists = ticketSchema.table(
  "event_artists",
  {
    eventId: text("event_id").notNull(),
    artistId: text("artist_id").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.artistId] }),
    foreignKey({
      columns: [t.artistId],
      foreignColumns: [artists.id],
    }),
    foreignKey({
      columns: [t.eventId],
      foreignColumns: [eventMeta.id],
    }),
  ],
);

export const eventMetrics = ticketSchema.table(
  "event_metrics",
  {
    eventId: text("event_id").notNull(),
    fetchDate: text("fetch_date").notNull(),
    minPriceTotal: integer("min_price_total").notNull(),
    minPricePrefee: integer("min_price_prefee").notNull(),
    searchScore: numeric("search_score"),
    popularityScore: numeric("popularity_score"),
    trendingScore: numeric("trending_score"),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.fetchDate] }),
    foreignKey({
      columns: [t.eventId],
      foreignColumns: [eventMeta.id],
    }),
    index("event_metrics_fetch_date_idx").on(t.fetchDate),
    index("event_metrics_event_id_popularity_score_idx").on(
      t.eventId,
      t.popularityScore,
    ),
  ],
);
