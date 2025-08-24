"use client";

import * as React from "react";
import { type RouterOutputs, api } from "@/trpc/react";

import { cn } from "@/lib/utils";
import { ChangeText } from "./change-text";
import { EventChart, TIME_WINDOWS } from "./event-chart";
import { Skeleton } from "./ui/skeleton";
import { useIsTouch } from "@/lib/use-is-touch";

type Event = RouterOutputs["events"]["getTrending"][number];

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
  selectedTimeWindow,
  showHighlight = true,
  className,
}: {
  event: Event;
  onSelect: (eventId: string) => void;
  isSelected: boolean;
  selectedTimeWindow: keyof typeof TIME_WINDOWS;
  showHighlight?: boolean;
  className?: string;
}) {
  const isTouch = useIsTouch();
  const { data: eventMetrics } = api.events.getEventMetrics.useQuery({
    eventId: event.id,
  });

  const { data: eventPriceChange } = api.events.getEventPriceChange.useQuery({
    eventId: event.id,
    windowDays: TIME_WINDOWS[selectedTimeWindow].days,
  });

  const handleSelect = () => {
    onSelect(event.id);
  };

  return (
    <div
      key={event.id}
      onMouseDown={handleSelect}
      className={cn(
        "cursor-default border-b p-2 transition-all duration-100",
        isSelected && showHighlight && "bg-accent/80",
        !isSelected && "hover:bg-accent/50",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium">{event.artistName}</p>
            {eventPriceChange ? (
              <p className="text-sm font-medium tabular-nums">
                {`$${eventPriceChange.currentPrice}`}
              </p>
            ) : (
              <Skeleton className="h-5 w-10" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground truncate text-xs">
              {formatVenue(
                event.venueCity ?? "",
                event.venueState ?? "",
                event.venueExtendedAddress ?? "",
              )}{" "}
              • {event.venueName}
            </p>
            {eventPriceChange ? (
              <ChangeText
                value={eventPriceChange.percentChange!}
                className="text-xs"
              />
            ) : (
              <Skeleton className="h-[18px] w-10" />
            )}
          </div>
        </div>
        {eventMetrics ? (
          <EventChart
            eventMetrics={eventMetrics}
            trendDirection={
              eventPriceChange?.rawChange && eventPriceChange.rawChange < 0
                ? "good"
                : "bad"
            }
            version="icon"
            disableAnimations={isTouch}
          />
        ) : (
          <Skeleton className="bg-primary/10 h-10 w-23 rounded-xs" />
        )}
      </div>
    </div>
  );
}
