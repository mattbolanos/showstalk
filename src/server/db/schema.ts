import {
  text,
  pgSchema,
  numeric,
  foreignKey,
  primaryKey,
  boolean,
  index,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const ticketSchema = pgSchema("ticket");

export const artists = ticketSchema.table(
  "artists",
  {
    ticketmasterId: text("ticketmaster_id").notNull().primaryKey(),
    id: text("id").notNull(),
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
  },
  (t) => [
    index("artists_name_idx").on(t.name),
    index("artists_slug_idx").on(t.slug),
  ],
);

export const eventMeta = ticketSchema.table(
  "event_meta",
  {
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
  },
  (t) => [
    index("event_meta_name_idx").on(t.name),
    index("event_meta_venue_name_idx").on(t.venueName),
    index("event_meta_venue_city_idx").on(t.venueCity),
    index("event_meta_venue_state_idx").on(t.venueState),
    index("event_meta_local_datetime_idx").on(t.localDatetime),
  ],
);

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
      foreignColumns: [artists.ticketmasterId],
    }),
    foreignKey({
      columns: [t.eventId],
      foreignColumns: [eventMeta.id],
    }),
    index("event_artists_artist_id_idx").on(t.artistId),
  ],
);

export const eventMetrics = ticketSchema.table(
  "event_metrics",
  {
    eventId: text("event_id").notNull(),
    fetchDate: date("fetch_date").notNull(),
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
    index("event_metrics_fetch_date_popularity_score_event_id_idx").on(
      t.fetchDate,
      t.popularityScore,
      t.eventId,
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
    references: [artists.ticketmasterId],
    relationName: "artist",
  }),
}));
