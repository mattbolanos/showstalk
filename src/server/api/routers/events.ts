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
      return ctx.db.query.eventMetrics.findMany({
        where: and(
          eq(eventMetrics.eventId, input.eventId),
          gt(eventMetrics.minPriceTotal, 0),
        ),
        columns: {
          fetchDate: true,
          minPriceTotal: true,
        },
        orderBy: asc(eventMetrics.fetchDate),
      });
    }),

  getEventMeta: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.eventMeta.findFirst({
        columns: {
          id: false,
          name: true,
          venueCity: true,
          venueState: true,
          venueName: true,
          venueExtendedAddress: true,
          localDatetime: true,
        },
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
      const metrics = await ctx.db
        .select({
          minPriceTotal: eventMetrics.minPriceTotal,
        })
        .from(eventMetrics)
        .where(eq(eventMetrics.eventId, input.eventId))
        .orderBy(desc(eventMetrics.fetchDate))
        .limit(input.windowDays == -1 ? 730 : input.windowDays + 1)
        .then((rows) => rows.map((row) => row.minPriceTotal));

      if (!metrics?.length) return null;

      const currentPrice = metrics.at(0);
      const historicalPrice = metrics.at(-1);

      if (!historicalPrice)
        return {
          currentPrice,
          rawChange: null,
          percentChange: null,
        };

      const rawChange = (currentPrice ?? 0) - (historicalPrice ?? 0);
      const percentChange = rawChange / (historicalPrice ?? 1);

      return {
        currentPrice,
        rawChange,
        percentChange,
      };
    }),

  searchArtists: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const q = input.query;

      return ctx.db
        .select({
          id: artists.id,
          name: artists.name,
          image: artists.image,
          genre: artists.genre,
        })
        .from(artists)
        .where(
          or(
            ilike(artists.name, `%${q}%`),
            ilike(artists.slug, `%${q}%`),
            sql`((${artists.name} || ' ' || ${artists.slug}) % ${q})`,
          ),
        )
        .orderBy(
          sql`
          CASE 
            WHEN ${artists.name} ILIKE ${"%" + q + "%"} 
              OR ${artists.slug} ILIKE ${"%" + q + "%"} 
            THEN 1 ELSE 2 
          END,
          similarity((${artists.name} || ' ' || ${artists.slug}), ${q}) DESC
        `,
        )
        .limit(10);
    }),

  searchEvents: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const q = input.query.trim();
      if (q.length < 2) return [];

      return ctx.db
        .select({
          id: eventMeta.id,
          name: eventMeta.name,
          venueCity: eventMeta.venueCity,
          venueState: eventMeta.venueState,
          venueName: eventMeta.venueName,
          venueExtendedAddress: eventMeta.venueExtendedAddress,
          localDatetime: eventMeta.localDatetime,
        })
        .from(eventMeta)
        .where(
          and(
            sql`
            ((${eventMeta.name} || ' ' || ${eventMeta.venueName} || ' ' || ${eventMeta.venueCity} || ' ' || ${eventMeta.venueState}) % ${q})
          `,
            gte(
              eventMeta.localDatetime,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            ),
          ),
        )
        .orderBy(
          sql`similarity((${eventMeta.name} || ' ' || ${eventMeta.venueName} || ' ' || ${eventMeta.venueCity} || ' ' || ${eventMeta.venueState}), ${q}) DESC`,
        )
        .limit(10);
    }),
});
