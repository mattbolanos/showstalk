"use client";

import * as React from "react";
import { type RouterOutputs, api } from "@/trpc/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { SearchIcon, StarsIcon } from "lucide-react";
import { EventChart, TIME_WINDOWS } from "./event-chart";
import { EventCard, formatVenue } from "./event-card";
import { TimeWindowSelect } from "./time-window-select";
import { useTimeWindow } from "@/stores/use-time-window";
import { Button } from "./ui/button";
import { useSearch } from "@/stores/use-search";
import NumberFlow from "@number-flow/react";
import { ChangeText } from "./change-text";

type TrendingEvents = RouterOutputs["events"]["getTrending"];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
};

const getDaysUntilEvent = (date: string): string => {
  const eventDate = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(eventDate.getTime() - today.getTime());
  const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  return daysAway === 1
    ? "tomorrow"
    : daysAway === 0
      ? "today"
      : `${daysAway} days away`;
};

export function FeaturedEvents({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<TrendingEvents>;
}) {
  const trendingEvents = React.use(trendingEventsPromise);

  const timeWindow = useTimeWindow((state) => state.timeWindow);
  const setSearchOpen = useSearch((state) => state.setSearchOpen);

  trendingEvents.map((event) => {
    api.events.getEventMeta.usePrefetchQuery({
      eventId: event.id,
    });
    api.events.getEventMetrics.usePrefetchQuery({
      eventId: event.id,
    });
    Object.values(TIME_WINDOWS).map((window) => {
      api.events.getEventPriceChange.usePrefetchQuery({
        eventId: event.id,
        windowDays: window.days,
      });
    });
  });

  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    trendingEvents[0]?.id ?? null,
  );

  const { data: eventMeta } = api.events.getEventMeta.useQuery({
    eventId: selectedEventId!,
  });

  const { data: eventMetrics } = api.events.getEventMetrics.useQuery({
    eventId: selectedEventId!,
  });

  const { data: eventPriceChange } = api.events.getEventPriceChange.useQuery({
    eventId: selectedEventId!,
    windowDays: TIME_WINDOWS[timeWindow].days,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="ring-input/60 bg-input hover:bg-input/60 relative w-full shrink-0 grid-cols-1 justify-start p-0 px-3 py-2 ring"
          onMouseDown={() => setSearchOpen(true)}
        >
          <span className="text-muted-foreground inline-flex pl-6 text-left text-base">
            Search for an artist or location...
          </span>
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </div>
        </Button>
        <TimeWindowSelect className="col-span-2 w-full justify-start" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 gap-0 overflow-hidden px-0 pt-4 pb-0 sm:px-0">
          <CardHeader className="px-2">
            <CardTitle className="text-primary flex items-center gap-2">
              <StarsIcon className="text-primary size-4" /> Trending Events
            </CardTitle>
          </CardHeader>

          {trendingEvents.slice(0, 5).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={() => setSelectedEventId(event.id)}
              selectedTimeWindow={timeWindow}
              className="last:border-b-0"
            />
          ))}
        </Card>
        <Card className="col-span-2">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center justify-between">
              <span>{eventMeta?.name}</span>
              <span className="flex items-center gap-1">
                <NumberFlow
                  value={eventPriceChange?.currentPrice ?? 0}
                  format={{
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  }}
                />
                <ChangeText
                  value={eventPriceChange?.percentChange}
                  className="text-sm font-medium"
                />
              </span>
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {formatVenue(
                  eventMeta?.venueCity ?? "",
                  eventMeta?.venueState ?? "",
                  eventMeta?.venueStreetAddress ?? "",
                )}{" "}
                • {eventMeta?.venueName} •{" "}
                {formatDate(eventMeta?.localDatetime ?? "")}
              </span>
              <span className="text-primary font-bold uppercase">
                {getDaysUntilEvent(eventMeta?.localDatetime ?? "")}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventChart
              eventMetrics={eventMetrics ?? []}
              trendDirection={
                eventPriceChange?.rawChange && eventPriceChange.rawChange < 0
                  ? "good"
                  : "bad"
              }
              version="full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
