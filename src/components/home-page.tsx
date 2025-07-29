"use client";

import * as React from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { FlameIcon } from "lucide-react";

import { EventCard } from "./event-card";
import { EventChart, TIME_WINDOWS } from "./event-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ChartContainer } from "./ui/chart";

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
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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

export function HomePageSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-4 w-30" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-5 w-24" />
          </CardDescription>
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
              <span className="flex items-center gap-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </span>
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex w-full justify-end gap-2">
              {Object.keys(TIME_WINDOWS).map((timeWindow) => (
                <Skeleton
                  key={timeWindow}
                  className="size-7 rounded-full sm:size-9"
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pr-1">
          <ChartContainer
            config={{}}
            className="aspect-auto h-[250px] w-full pr-5"
          >
            <Skeleton className="h-full w-full" />
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="space-y-2">
        <span className="flex items-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <h2 className="text-lg font-bold">Trending</h2>
        </span>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-15 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
