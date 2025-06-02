import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import Image from "next/image";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Event = RouterOutput["events"]["getTrending"][number];

export function EventCard({ event }: { event: Event }) {
  return (
    <div
      key={event.id}
      className="hover:bg-accent flex justify-between rounded-md p-2 transition-all duration-150"
    >
      <div className="flex items-center">
        <div className="bg-muted mr-3 size-10 overflow-hidden rounded-[0.5rem]">
          <Image
            src={event.artistImage}
            alt={event.artistName}
            width={40}
            height={40}
            loading="eager"
            className="size-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-medium">{event.artistName}</h2>
          <p className="text-muted-foreground text-xs">
            {event.venueName}, {event.venueCity}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <h2 className="font-bold">{`$${event.minPriceTotal}`}</h2>
        </div>
      </div>
    </div>
  );
}
