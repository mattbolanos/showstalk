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
import { EventChart } from "./event-chart";

type TrendingEvents = RouterOutputs["events"]["getTrending"];

export function FeaturedEvents({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<TrendingEvents>;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <StarsIcon className="text-primary size-4" /> Featured Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EventChart
          eventMetrics={eventMetrics ?? []}
          eventMeta={eventMeta}
          isLoading={eventMetaLoading || eventMetricsLoading}
        />
      </CardContent>
    </Card>
  );
}
