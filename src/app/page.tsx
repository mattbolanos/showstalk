import { FlameIcon } from "lucide-react";
import { api, HydrateClient } from "@/trpc/server";
import { EventCard } from "@/components/event-card";
import { Suspense } from "react";
import { EventChart } from "@/components/event-chart";

async function TrendingEvents() {
  const trendingEvents = await api.events.getTrending();
  return (
    <div className="flex flex-col gap-y-4">
      {trendingEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col space-y-4 px-8 py-20">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Showstalk</h1>
          </div>
        </header>
        <Suspense fallback={<div>Loading...</div>}>
          <EventChart
            initialDataPromise={api.events.getEventMetrics({
              eventId: "678558383656f182d9f4e1a8",
            })}
          />
        </Suspense>
        <span className="flex items-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <h2 className="text-lg font-bold">Trending</h2>
        </span>
        <Suspense fallback={<div>Loading...</div>}>
          <TrendingEvents />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
