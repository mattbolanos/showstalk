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
import { relations } from "drizzle-orm";

const ticketSchema = pgSchema("ticket");

export const artists = ticketSchema.table("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  upcoming_shows: numeric("upcoming_shows"),
  image: text("image"),
  slug: text("slug").notNull(),
  genre: text("genre"),
  subgenre: text("subgenre"),
  link_instagram: text("link_instagram"),
  link_spotify: text("link_spotify"),
  link_itunes: text("link_itunes"),
  link_twitter: text("link_twitter"),
  link_musicbrainz: text("link_musicbrainz"),
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

export const eventMetaRelations = relations(eventMeta, ({ many }) => ({
  eventArtists: many(eventArtists),
}));

export const artistRelations = relations(artists, ({ many }) => ({
  eventArtists: many(eventArtists),
}));

export const eventArtistsRelations = relations(eventArtists, ({ one }) => ({
  event: one(eventMeta, {
    fields: [eventArtists.eventId],
    references: [eventMeta.id],
  }),
  artist: one(artists, {
    fields: [eventArtists.artistId],
    references: [artists.id],
    relationName: "artist",
  }),
}));
