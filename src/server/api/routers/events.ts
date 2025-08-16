import {
  type createTRPCContext,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import {
  eventMeta,
  eventArtists,
  eventMetrics,
  artists,
} from "@/server/db/schema";
import { and, asc, desc, eq, gt, gte, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

const latestFetchDateSubquery = sql`(SELECT MAX(${eventMetrics.fetchDate}) FROM ${eventMetrics})`;

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const getTrending = async (ctx: Context) => {
  const rankedEvents = ctx.db
    .select({
      eventId: eventMetrics.eventId,
      popularityScore: eventMetrics.popularityScore,
      artistId: eventArtists.artistId,
      minPriceTotal: eventMetrics.minPriceTotal,
      artistRank: sql<number>`ROW_NUMBER() OVER (
        PARTITION BY ${eventArtists.artistId}
        ORDER BY ${eventMetrics.popularityScore} DESC
      )`.as("artist_rank"),
      eventRank: sql<number>`ROW_NUMBER() OVER (
        PARTITION BY ${eventMetrics.eventId}
        ORDER BY ${eventMetrics.popularityScore} DESC
      )`.as("event_rank"),
    })
    .from(eventMetrics)
    .leftJoin(eventArtists, eq(eventArtists.eventId, eventMetrics.eventId))
    .where(eq(eventMetrics.fetchDate, latestFetchDateSubquery))
    .as("ranked_events");

  return await ctx.db
    .select({
      id: rankedEvents.eventId,
      name: eventMeta.name,
      artistId: rankedEvents.artistId,
      artistName: artists.name,
      artistImage: artists.image,
      venueCity: eventMeta.venueCity,
      venueName: eventMeta.venueName,
      venueState: eventMeta.venueState,
      venueExtendedAddress: eventMeta.venueExtendedAddress,
      localDatetime: eventMeta.localDatetime,
      minPriceTotal: rankedEvents.minPriceTotal,
      updatedAt: eventMeta.updatedAt,
    })
    .from(rankedEvents)
    .leftJoin(eventMeta, eq(eventMeta.id, rankedEvents.eventId))
    .leftJoin(artists, eq(artists.id, rankedEvents.artistId))
    .where(
      and(
        eq(rankedEvents.artistRank, 1),
        eq(rankedEvents.eventRank, 1),
        gte(eventMeta.utcDatetime, new Date().toISOString()),
      ),
    )
    .orderBy(desc(rankedEvents.popularityScore))
    .limit(6);
};

export const eventsRouter = createTRPCRouter({
  getTrending: publicProcedure.query(async ({ ctx }) => {
    return getTrending(ctx);
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
      let comparisonPriceQuery;

      if (input.windowDays === -1) {
        // take the first price
        comparisonPriceQuery = ctx.db
          .select({
            minPriceTotal:
              sql<number>`CAST(${eventMetrics.minPriceTotal} AS INT)`.as(
                "min_price_total",
              ),
          })
          .from(eventMetrics)
          .where(eq(eventMetrics.eventId, input.eventId))
          .orderBy(asc(eventMetrics.fetchDate))
          .limit(1)
          .as("comparison_date");
      } else {
        const dateBounds = await ctx.db
          .select({
            minDate: sql<Date>`MIN(${eventMetrics.fetchDate})`.as("min_date"),
            maxDate: sql<Date>`MAX(${eventMetrics.fetchDate})`.as("max_date"),
          })
          .from(eventMetrics)
          .where(eq(eventMetrics.eventId, input.eventId))
          .then((rows) => rows[0]);

        if (!dateBounds) return null;
        const comparisonDate = (() => {
          const targetDate = new Date(dateBounds.maxDate);
          targetDate.setDate(targetDate.getDate() - input.windowDays);

          // if target date is before min date, use min date
          if (targetDate < new Date(dateBounds.minDate)) {
            return dateBounds.minDate;
          }

          return targetDate.toISOString().split("T")[0];
        })();

        comparisonPriceQuery = ctx.db
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
          .limit(1)
          .as("comparison_date");
      }

      const latestPriceQuery = ctx.db
        .select({
          currentPrice:
            sql<number>`CAST(${eventMetrics.minPriceTotal} AS INT)`.as(
              "current_price",
            ),
        })
        .from(eventMetrics)
        .where(eq(eventMetrics.eventId, input.eventId))
        .orderBy(desc(eventMetrics.fetchDate))
        .limit(1)
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
