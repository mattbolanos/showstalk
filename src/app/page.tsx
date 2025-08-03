import { api } from "@/trpc/server";
import { Suspense } from "react";

import { HomePage, HomePageSkeleton } from "@/components/home-page";
import { Hero } from "@/components/hero";

export default function Home() {
  void api.events.getTrending.prefetch();

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-lg flex-col space-y-4">
      <Hero trendingEventsPromise={api.events.getTrending()} />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePage trendingEventsPromise={api.events.getTrending()} />
      </Suspense>
    </div>
  );
}
