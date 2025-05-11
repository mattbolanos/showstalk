import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const artistRouter = createTRPCRouter({
  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.artists.findFirst({
      orderBy: (artists, { desc }) => [desc(artists.upcoming_shows)],
    });

    return post ?? null;
  }),
});
