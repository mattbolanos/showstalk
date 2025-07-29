import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  eventMeta,
  eventArtists,
  eventMetrics,
  artists,
} from "@/server/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  isNotNull,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

const latestFetchDateSubquery = sql`(SELECT MAX(${eventMetrics.fetchDate}) FROM ${eventMetrics})`;

const rowNumber =
  sql<number>`ROW_NUMBER() OVER (PARTITION BY ${eventMetrics.eventId})`.as(
    "row_num",
  );

export const eventsRouter = createTRPCRouter({
  getTrending: publicProcedure.query(async ({ ctx }) => {
    const topArtistsSubquery = ctx.db
      .select({
        id: artists.id,
        name: artists.name,
        image: artists.image,
        maxPop: sql<number>`MAX(${eventMetrics.popularityScore})`.as("max_pop"),
      })
      .from(artists)
      .leftJoin(eventArtists, eq(eventArtists.artistId, artists.id))
      .leftJoin(eventMetrics, eq(eventMetrics.eventId, eventArtists.eventId))
      .where(
        and(
          isNotNull(eventMetrics.popularityScore),
          sql`${eventMetrics.fetchDate} = ${latestFetchDateSubquery}`,
        ),
      )
      .groupBy(artists.id, artists.name, artists.image)
      .orderBy(desc(sql`MAX(${eventMetrics.popularityScore})`))
      .limit(20)
      .as("top_artists");

    // Main query combining both CTEs
    const shows = ctx.db
      .with(topArtistsSubquery)
      .select({
        id: eventMetrics.eventId,
        name: sql<string>`${eventMeta.name}`.as("name"),
        artistName: sql<string>`${topArtistsSubquery.name}`.as("artist_name"),
        artistImage: sql<string>`${topArtistsSubquery.image}`.as(
          "artist_image",
        ),
        venueCity: sql<string>`${eventMeta.venueCity}`.as("venue_city"),
        venueState: sql<string>`${eventMeta.venueState}`.as("venue_state"),
        venueExtendedAddress: sql<string>`${eventMeta.venueExtendedAddress}`.as(
          "venue_extended_address",
        ),
        venueName: sql<string>`${eventMeta.venueName}`.as("venue_name"),
        localDatetime: sql<string>`${eventMeta.localDatetime}`.as(
          "local_datetime",
        ),
        minPricePrefee: sql<number>`${eventMetrics.minPricePrefee}`.as(
          "min_price_prefee",
        ),
        minPriceTotal: sql<number>`${eventMetrics.minPriceTotal}`.as(
          "min_price_total",
        ),
        updatedAt: sql<string>`${eventMeta.updatedAt}`.as("updated_at"),
        rowNum: rowNumber,
      })
      .from(eventMetrics)
      .leftJoin(eventArtists, eq(eventArtists.eventId, eventMetrics.eventId))
      .leftJoin(
        topArtistsSubquery,
        sql`${topArtistsSubquery.id} = ${eventArtists.artistId} AND 
          ${topArtistsSubquery.maxPop} = ${eventMetrics.popularityScore}`,
      )
      .leftJoin(eventMeta, eq(eventMeta.id, eventMetrics.eventId))
      .where(
        sql`${topArtistsSubquery.id} IS NOT NULL AND 
          ${eventMetrics.fetchDate} = ${latestFetchDateSubquery}`,
      )
      .orderBy(desc(topArtistsSubquery.maxPop))
      .as("shows");

    return ctx.db.select().from(shows).where(eq(rowNumber, 1)).limit(8);
  }),

  getEventMetrics: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          fetchDate: eventMetrics.fetchDate,
          minPriceTotal:
            sql<number>`CAST(${eventMetrics.minPriceTotal} AS INT)`.as(
              "min_price_total",
            ),
        })
        .from(eventMetrics)
        .where(
          and(
            eq(eventMetrics.eventId, input.eventId),
            gt(eventMetrics.minPriceTotal, 0),
          ),
        )
        .orderBy(asc(eventMetrics.fetchDate));
    }),

  getEventMeta: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(eventMeta)
        .where(eq(eventMeta.id, input.eventId))
        .limit(1)
        .then((event) => event[0]);
    }),

  searchArtists: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.artists.findMany({
        where: or(
          ilike(artists.name, `%${input.query}%`),
          ilike(artists.slug, `%${input.query}%`),
        ),
        limit: 10,
      });
    }),

  searchEvents: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.query.length < 2) return [];

      const searchTerms = input.query.split(" ").filter(Boolean);

      return ctx.db.query.eventMeta.findMany({
        where: and(
          ...searchTerms.map((term) =>
            or(
              ilike(eventMeta.name, `%${term}%`),
              ilike(artists.name, `%${term}%`),
              ilike(eventMeta.venueName, `%${term}%`),
              ilike(eventMeta.venueCity, `%${term}%`),
              ilike(eventMeta.venueState, `%${term}%`),
            ),
          ),
          gte(
            eventMeta.localDatetime,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        ),
        with: {
          eventArtists: {
            with: {
              artist: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
        limit: 8,
      });
    }),
});
