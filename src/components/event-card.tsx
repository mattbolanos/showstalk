"use client";

import * as React from "react";
import { type RouterOutputs, api } from "@/trpc/react";

import { cn } from "@/lib/utils";
import { EventChart, TIME_WINDOWS } from "./event-chart";

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

const formatPercentChange = (percentChange: number) => {
  return percentChange.toLocaleString("en-US", {
    style: "percent",
    signDisplay: "always",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export function EventCard({
  event,
  onSelect,
  isSelected,
  selectedTimeWindow,
  className,
}: {
  event: Event;
  onSelect: () => void;
  isSelected: boolean;
  selectedTimeWindow: keyof typeof TIME_WINDOWS;
  className?: string;
}) {
  const { data: eventMetrics } = api.events.getEventMetrics.useQuery({
    eventId: event.id,
  });

  const { data: eventPriceChange } = api.events.getEventPriceChange.useQuery({
    eventId: event.id,
    windowDays: TIME_WINDOWS[selectedTimeWindow].days,
  });

  return (
    <div
      key={event.id}
      onMouseDown={onSelect}
      className={cn(
        "flex cursor-pointer justify-between border-b p-2 pr-0 transition-all duration-100",
        isSelected && "bg-accent",
        !isSelected && "hover:bg-accent/50",
        className,
      )}
    >
      <div className="flex items-center">
        <div>
          <h2 className="font-medium">{event.artistName}</h2>
          <p className="text-muted-foreground text-xs">
            {formatVenue(
              event.venueCity,
              event.venueState,
              event.venueExtendedAddress,
            )}{" "}
            • {event.venueName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1">
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium">
            ${eventPriceChange?.currentPrice}
          </p>
          <p
            className={cn(
              "text-xs font-medium tabular-nums",
              eventPriceChange?.rawChange && eventPriceChange.rawChange < 0
                ? "text-change-good"
                : "text-change-bad",
            )}
          >
            {formatPercentChange(eventPriceChange?.percentChange ?? 0)}
          </p>
        </div>

        <EventChart
          eventMetrics={eventMetrics ?? []}
          trendDirection={
            eventPriceChange?.rawChange && eventPriceChange.rawChange < 0
              ? "good"
              : "bad"
          }
          version="icon"
        />
      </div>
    </div>
  );
}
