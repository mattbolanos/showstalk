import { api } from "@/trpc/server";
import { Suspense } from "react";

import { HomePage, HomePageSkeleton } from "@/components/home-page";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col space-y-4">
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePage trendingEventsPromise={api.events.getTrending()} />
      </Suspense>
    </div>
  );
}
