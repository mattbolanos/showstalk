import { api } from "@/trpc/server";
import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { FeaturedEvents } from "@/components/featured-events";
import { TIME_WINDOWS } from "@/components/event-chart";
import { HeroCards, HeroCardVisual } from "@/components/hero-cards";

async function TrendingPrefetches() {
  const trendingEvents = await api.events.getTrending();
  trendingEvents.map((event) => {
    void api.events.getEventMeta.prefetch({
      eventId: event.id,
    });
    void api.events.getEventMetrics.prefetch({
      eventId: event.id,
    });
    Object.values(TIME_WINDOWS).map((window) => {
      void api.events.getEventPriceChange.prefetch({
        eventId: event.id,
        windowDays: window.days,
      });
    });
  });

  return null;
}

async function HeroCardWrapper() {
  const trendingEvents = await api.events.getTrending();
  return <HeroCards topEvents={trendingEvents.slice(0, 3)} />;
}

export default function Home() {
  void api.events.getTrending.prefetch();

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col space-y-4">
      <TrendingPrefetches />
      {/* Hero section */}
      <section className="relative w-full overflow-hidden py-4 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="flex w-full flex-col items-center justify-between gap-16 lg:flex-row lg:gap-8">
            <Hero />
            <Suspense fallback={<HeroCardVisual />}>
              <HeroCardWrapper />
            </Suspense>
          </div>
        </div>
      </section>
      <Suspense fallback={<div>Loading...</div>}>
        <FeaturedEvents trendingEventsPromise={api.events.getTrending()} />
      </Suspense>
    </div>
  );
}
