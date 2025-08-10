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
import { EventCard } from "./event-card";

type TrendingEvents = RouterOutputs["events"]["getTrending"];

export function FeaturedEvents({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<TrendingEvents>;
}) {
  const trendingEvents = React.use(trendingEventsPromise);

  const [selectedTimeWindow, setSelectedTimeWindow] =
    React.useState<keyof typeof TIME_WINDOWS>("2W");

  trendingEvents.map((event) => {
    api.events.getEventMeta.usePrefetchQuery({
      eventId: event.id,
    });
    api.events.getEventMetrics.usePrefetchQuery({
      eventId: event.id,
    });
    api.events.getEventPriceChange.usePrefetchQuery({
      eventId: event.id,
      windowDays: TIME_WINDOWS[selectedTimeWindow].days,
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
    windowDays: TIME_WINDOWS[selectedTimeWindow].days,
  });

  return (
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
            selectedTimeWindow={selectedTimeWindow}
            className="last:border-b-0"
          />
        ))}
      </Card>
      <Card className="col-span-2">
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
  );
}
