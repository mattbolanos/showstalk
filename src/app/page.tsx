import { FlameIcon } from "lucide-react";

import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.artist.getLatest();

  void api.artist.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col space-y-4 px-8 py-20">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Showstalk</h1>
          </div>
        </header>
        <span className="flex items-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <h2 className="text-lg font-bold">Trending</h2>
        </span>{" "}
      </main>
    </HydrateClient>
  );
}
