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
type TrendingEvent = {
  id: string;
  name: string;
  venueCity: string;
  venueState: string;
  venueName: string;
  venueExtendedAddress: string;
  localDatetime: string;
  metrics: { minPriceTotal: number }[];
  eventArtists: { artistId: string; artist: { name: string; image: string } }[];
};

const getTrending = async (ctx: Context) => {
  const rawTrendingEvents = await ctx.db
    .select({
      eventId: eventMeta.id,
      name: eventMeta.name,
      venueCity: eventMeta.venueCity,
      venueState: eventMeta.venueState,
      venueName: eventMeta.venueName,
      venueExtendedAddress: eventMeta.venueExtendedAddress,
      localDatetime: eventMeta.localDatetime,
      artistId: eventArtists.artistId,
      artistName: artists.name,
      artistImage: artists.image,
      minPriceTotal: eventMetrics.minPriceTotal,
    })
    .from(eventMeta)
    .leftJoin(eventArtists, eq(eventMeta.id, eventArtists.eventId))
    .leftJoin(artists, eq(eventArtists.artistId, artists.id))
    .leftJoin(eventMetrics, eq(eventMeta.id, eventMetrics.eventId))
    .where(
      and(
        eq(eventArtists.artistEventRank, 1),
        eq(eventMetrics.fetchDate, latestFetchDateSubquery),
      ),
    )
    .orderBy(desc(eventMetrics.popularityScore))
    .limit(10);

  // Create object to store events with artists
  const trendingEvents = rawTrendingEvents.reduce(
    (acc, event) => {
      // If event doesn't exist in accumulator, create it
      if (!(event.eventId in acc)) {
        acc[event.eventId] = {
          id: event.eventId,
          name: event.name,
          venueCity: event.venueCity,
          venueState: event.venueState,
          venueName: event.venueName,
          venueExtendedAddress: event.venueExtendedAddress!,
          localDatetime: event.localDatetime,
          metrics: [
            {
              minPriceTotal: event.minPriceTotal!,
            },
          ],
          eventArtists: [],
        };
      }

      // Add artist if it exists
      if (event.artistId) {
        acc[event.eventId]!.eventArtists.push({
          artistId: event.artistId,
          artist: {
            name: event.artistName!,
            image: event.artistImage!,
          },
        });
      }

      return acc;
    },
    {} as Record<string, TrendingEvent>,
  );

  // Convert object to array
  return Object.values(trendingEvents);
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
        .limit(input.windowDays == -1 ? 730 : input.windowDays)
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
      const q = input.query.trim();
      if (q.length < 2) return [];

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
            // Basic substring matches
            ilike(artists.name, `%${q}%`),
            ilike(artists.slug, `%${q}%`),

            // Trigram similarity with threshold
            sql`
              similarity(
                (${artists.name} || ' ' || ${artists.slug}),
                ${q}
              ) > 0.3
            `,

            // Weighted FTS (name = A, slug = B)
            sql`
              (
                setweight(to_tsvector('english', unaccent(${artists.name})), 'A') ||
                setweight(to_tsvector('english', unaccent(${artists.slug})), 'B')
              ) @@ plainto_tsquery('english', ${q})
            `,
          ),
        )
        .orderBy(
          sql`
          CASE 
            WHEN ${artists.name} ILIKE ${"%" + q + "%"} 
              OR ${artists.slug} ILIKE ${"%" + q + "%"} 
            THEN 1 ELSE 2 
          END,
          GREATEST(
            similarity((${artists.name} || ' ' || ${artists.slug}), ${q}),
            ts_rank(
              (
                setweight(to_tsvector('english', unaccent(${artists.name})), 'A') ||
                setweight(to_tsvector('english', unaccent(${artists.slug})), 'B')
              ),
              plainto_tsquery('english', ${q})
            )
          ) DESC
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
            or(
              // Basic substring matches
              ilike(eventMeta.name, `%${q}%`),
              ilike(eventMeta.venueName, `%${q}%`),
              ilike(eventMeta.venueCity, `%${q}%`),
              ilike(eventMeta.venueState, `%${q}%`),

              // Trigram similarity with threshold (typo-tolerant)
              sql`
                similarity(
                  (${eventMeta.name} || ' ' || ${eventMeta.venueName} || ' ' || ${eventMeta.venueCity} || ' ' || ${eventMeta.venueState}),
                  ${q}
                ) > 0.3
              `,

              // Weighted Full-text search
              sql`
                (
                  setweight(to_tsvector('english', unaccent(${eventMeta.name})), 'A') ||
                  setweight(to_tsvector('english', unaccent(${eventMeta.venueName})), 'B') ||
                  setweight(to_tsvector('english', unaccent(${eventMeta.venueCity} || ' ' || ${eventMeta.venueState})), 'C')
                ) @@ plainto_tsquery('english', ${q})
              `,
            ),
            // Only include events in the future or within the last 7 days
            gte(
              eventMeta.utcDatetime,
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            ),
          ),
        )
        .orderBy(
          sql`
          CASE 
            WHEN ${eventMeta.name} ILIKE ${"%" + q + "%"}
              OR ${eventMeta.venueName} ILIKE ${"%" + q + "%"}
              OR ${eventMeta.venueCity} ILIKE ${"%" + q + "%"}
              OR ${eventMeta.venueState} ILIKE ${"%" + q + "%"}
            THEN 1 ELSE 2 
          END,
          GREATEST(
            similarity(
              (${eventMeta.name} || ' ' || ${eventMeta.venueName} || ' ' || ${eventMeta.venueCity} || ' ' || ${eventMeta.venueState}),
              ${q}
            ),
            ts_rank(
              (
                setweight(to_tsvector('english', unaccent(${eventMeta.name})), 'A') ||
                setweight(to_tsvector('english', unaccent(${eventMeta.venueName})), 'B') ||
                setweight(to_tsvector('english', unaccent(${eventMeta.venueCity} || ' ' || ${eventMeta.venueState})), 'C')
              ),
              plainto_tsquery('english', ${q})
            )
          ) DESC,
           ${eventMeta.utcDatetime} ASC
        `,
        )
        .limit(8);
    }),
});
