"use client";

import * as React from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { FlameIcon } from "lucide-react";

import { EventCard } from "./event-card";
import { EventChart } from "./event-chart";

type TrendingEvent = RouterOutputs["events"]["getTrending"][number];

export function HomePage({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<TrendingEvent[]>;
}) {
  const trendingEvents = React.use(trendingEventsPromise);

  trendingEvents.map((event) => {
    api.events.getEventMeta.usePrefetchQuery({
      eventId: event.id,
    });
    api.events.getEventMetrics.usePrefetchQuery({
      eventId: event.id,
    });
  });

  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    trendingEvents[0]?.id ?? null,
  );

  const { data: eventMeta, isLoading: eventMetaLoading } =
    api.events.getEventMeta.useQuery({
      eventId: selectedEventId!,
    });

  const { data: eventMetrics, isLoading: eventMetricsLoading } =
    api.events.getEventMetrics.useQuery({
      eventId: selectedEventId!,
    });

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  return (
    <div className="space-y-6">
      <EventChart
        eventMetrics={eventMetrics ?? []}
        eventMeta={eventMeta}
        isLoading={eventMetaLoading || eventMetricsLoading}
      />
      <div className="space-y-2">
        <span className="flex items-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <h2 className="text-lg font-bold">Trending</h2>
        </span>
        <div className="grid grid-cols-2 gap-2">
          {trendingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={() => handleEventClick(event.id)}
              isSelected={selectedEventId === event.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
