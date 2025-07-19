"use client";

import * as React from "react";
import { api } from "@/trpc/react";

import { EventChart } from "./event-chart";

export function HomeEventParent({
  defaultSelectedEventId,
}: {
  defaultSelectedEventId: string;
}) {
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    defaultSelectedEventId,
  );

  const [eventMeta] = api.events.getEventMeta.useSuspenseQuery({
    eventId: selectedEventId ?? defaultSelectedEventId,
  });

  const [eventMetrics] = api.events.getEventMetrics.useSuspenseQuery({
    eventId: selectedEventId ?? defaultSelectedEventId,
  });

  return (
    <div>
      <EventChart eventMetrics={eventMetrics} eventMeta={eventMeta} />
    </div>
  );
}
