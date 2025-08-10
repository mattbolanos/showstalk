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
      .from(eventArtists)
      .innerJoin(eventMetrics, eq(eventMetrics.eventId, eventArtists.eventId))
      .innerJoin(artists, eq(eventArtists.artistId, artists.id))
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
      .innerJoin(eventArtists, eq(eventArtists.eventId, eventMetrics.eventId))
      .innerJoin(
        topArtistsSubquery,
        sql`${topArtistsSubquery.id} = ${eventArtists.artistId} AND ${topArtistsSubquery.maxPop} = ${eventMetrics.popularityScore}`,
      )
      .innerJoin(eventMeta, eq(eventMeta.id, eventMetrics.eventId))
      .where(sql`${eventMetrics.fetchDate} = ${latestFetchDateSubquery}`)
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
          fetchDate: sql<Date>`${eventMetrics.fetchDate}`.as("fetch_date"),
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
      return ctx.db.query.eventMeta.findFirst({
        where: eq(eventMeta.id, input.eventId),
      });
    }),

  getEventPriceChange: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        windowDays: z.number().int().min(-1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const latestDate = await ctx.db
        .select({
          latest: sql<string>`MAX(${eventMetrics.fetchDate})`.as("latest"),
          minDate: sql<string>`MIN(${eventMetrics.fetchDate})`.as("min_date"),
        })
        .from(eventMetrics)
        .where(eq(eventMetrics.eventId, input.eventId))
        .then((rows) => rows[0]);

      if (!latestDate) return null;

      const comparisonDate =
        input.windowDays === -1
          ? latestDate.minDate
          : (() => {
              const targetDate = new Date(latestDate.latest);
              targetDate.setDate(targetDate.getDate() - input.windowDays);
              const targetDateStr = targetDate.toISOString().split("T")[0];

              // If target date is before minDate, use minDate instead
              return targetDate < new Date(latestDate.minDate)
                ? latestDate.minDate
                : targetDateStr;
            })();

      const comparisonPriceQuery = ctx.db
        .select({
          minPriceTotal:
            sql<number>`CAST(${eventMetrics.minPriceTotal} AS INT)`.as(
              "min_price_total",
            ),
        })
        .from(eventMetrics)
        .where(
          and(
            eq(eventMetrics.eventId, input.eventId),
            sql`${eventMetrics.fetchDate} = ${comparisonDate}`,
          ),
        )
        .as("comparison_date");

      const latestPriceQuery = ctx.db
        .select({
          currentPrice:
            sql<number>`CAST(${eventMetrics.minPriceTotal} AS INT)`.as(
              "current_price",
            ),
        })
        .from(eventMetrics)
        .where(
          and(
            eq(eventMetrics.eventId, input.eventId),
            sql`${eventMetrics.fetchDate} = ${latestDate.latest}`,
          ),
        )
        .as("latest_price");

      return await ctx.db
        .select({
          currentPrice: latestPriceQuery.currentPrice,
          rawChange:
            sql<number>`${latestPriceQuery.currentPrice} - ${comparisonPriceQuery.minPriceTotal}`.as(
              "raw_change",
            ),
          percentChange: sql<number>`CASE 
            WHEN ${comparisonPriceQuery.minPriceTotal} > 0 
            THEN CAST((${latestPriceQuery.currentPrice} - ${comparisonPriceQuery.minPriceTotal})::FLOAT / ${comparisonPriceQuery.minPriceTotal}::FLOAT AS FLOAT)
            ELSE 0 
          END`.as("percent_change"),
        })
        .from(latestPriceQuery)
        .leftJoin(comparisonPriceQuery, sql`true`)
        .then((rows) => rows[0]);
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
