import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

import { HomePage } from "@/components/home-page";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col space-y-4">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Showstalk</h1>
          </div>
        </header>
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage trendingEventsPromise={api.events.getTrending()} />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
