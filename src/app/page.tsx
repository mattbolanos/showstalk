import { api } from "@/trpc/server";
import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { FeaturedEvents } from "@/components/featured-events";

export default function Home() {
  void api.events.getTrending.prefetch();

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col space-y-4">
      <Hero trendingEventsPromise={api.events.getTrending()} />
      <FeaturedEvents trendingEventsPromise={api.events.getTrending()} />
    </div>
  );
}
