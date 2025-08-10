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
import { StarsIcon } from "lucide-react";
import { EventChart, TIME_WINDOWS } from "./event-chart";
import { EventCard, formatVenue } from "./event-card";
import { TimeWindowSelect } from "./time-window-select";
import { useTimeWindow } from "@/stores/use-time-window";

type TrendingEvents = RouterOutputs["events"]["getTrending"];

export function FeaturedEvents({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<TrendingEvents>;
}) {
  const trendingEvents = React.use(trendingEventsPromise);

  const timeWindow = useTimeWindow((state) => state.timeWindow);

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
    <div>
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
          <CardHeader>
            <CardTitle>{eventMeta?.name}</CardTitle>
            <CardDescription>
              {formatVenue(
                eventMeta?.venueCity ?? "",
                eventMeta?.venueState ?? "",
                eventMeta?.venueStreetAddress ?? "",
              )}{" "}
              • {eventMeta?.venueName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeWindowSelect />
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
