import type { RouterOutputs } from "@/trpc/react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Event = RouterOutputs["events"]["getTrending"][number];

export const formatDate = (date: string) => {
  return new Date(date)
    .toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    })
    .replace(",", "");
};

export function EventCard({
  event,
  onSelect,
  isSelected,
}: {
  event: Event;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <div
      key={event.id}
      onMouseDown={onSelect}
      className={cn(
        "flex justify-between rounded-md p-2 transition-all duration-100",
        isSelected && "bg-primary/20 ring-primary ring-2",
        !isSelected && "hover:bg-primary/10",
      )}
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
          <p className="text-muted-foreground text-sm">
            {event.venueCity}, {event.venueState} •{" "}
            {formatDate(event.localDatetime)}
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
