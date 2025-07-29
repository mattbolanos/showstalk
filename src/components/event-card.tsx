import type { RouterOutputs } from "@/trpc/react";

import { cn } from "@/lib/utils";
import { MapPinIcon } from "lucide-react";
import { ArtistImage } from "./artist-image";

type Event = RouterOutputs["events"]["getTrending"][number];

const formatDate = (date: string) => {
  return new Date(date)
    .toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "UTC",
    })
    .replace(",", "");
};

export const formatVenue = (
  city: string,
  state: string,
  extendedAddress: string,
) => {
  const trimmedState = state.trim();
  if (trimmedState) return `${city}, ${trimmedState}`;
  if (extendedAddress) {
    if (extendedAddress.includes(",")) return extendedAddress;
    return `${city}, ${extendedAddress}`;
  }
  return city;
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
        "flex cursor-pointer justify-between rounded-md p-2 transition-all duration-100",
        isSelected && "bg-primary/20 ring-primary ring-2",
        !isSelected && "hover:bg-primary/10",
      )}
    >
      <div className="flex items-center">
        <ArtistImage
          imageUrl={event.artistImage}
          artistName={event.artistName}
          containerClassName="mr-3 size-11"
        />
        <div>
          <h2 className="font-medium">{event.artistName}</h2>
          <p className="text-muted-foreground flex items-center text-sm">
            <MapPinIcon className="mr-0.5 size-3" />
            {formatVenue(
              event.venueCity,
              event.venueState,
              event.venueExtendedAddress,
            )}{" "}
            • {formatDate(event.localDatetime)}
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
