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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ChevronDownIcon,
  MicVocalIcon,
  SearchIcon,
  TicketIcon,
  TrendingUpIcon,
} from "lucide-react";
import { EventChart, TIME_WINDOWS } from "./event-chart";
import { EventCard, formatVenue } from "./event-card";
import { TimeWindowSelect } from "./time-window-select";
import { useTimeWindow } from "@/stores/use-time-window";
import { Button } from "./ui/button";
import { useSearch } from "@/stores/use-search";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

import { ChangeText } from "./change-text";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";


type TrendingEvents = RouterOutputs["events"]["getTrending"];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
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

  const selectedEvent = trendingEvents.find(
    (event) => event.id === selectedEventId,
  );



  return (
    <div className="space-y-4">
      <div className="gap-4 md:grid md:grid-cols-3">
        <Button
          variant="outline"
          className="ring-input/60 bg-input hover:bg-input/60 relative col-span-1 w-full shrink-0 justify-start rounded-sm p-0 px-3 py-2 ring"
          onMouseDown={() => setSearchOpen(true)}
        >
          <span className="text-muted-foreground inline-flex pl-6 text-left text-base">
            Search...
          </span>
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </div>
        </Button>
        <TimeWindowSelect className="col-span-2 hidden w-full justify-start md:block" />
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
        <Card className="col-span-1 gap-0 overflow-hidden px-0 pt-4 pb-0 sm:px-0">
          <CardHeader className="px-2">
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUpIcon className="text-primary size-4" /> Trending Events
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
        <Card className="col-span-2 hidden gap-4 pr-0 pb-0 md:block">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center justify-between">
              {eventMeta && selectedEvent ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group h-auto justify-start p-0 text-left hover:bg-transparent"
                    >
                      <div className="flex items-center gap-1">
                        <h2 className="text-foreground group-hover:text-primary text-base transition-colors">
                          {selectedEvent.artistName}
                        </h2>
                        <ChevronDownIcon className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href={`/artist/${selectedEvent.artistId}`}
                        prefetch={true}
                      >
                        <MicVocalIcon className="stroke-1.5 stroke-primary size-4" />
                        View Artist Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/event/${selectedEventId}`} prefetch={true}>
                        <TicketIcon className="stroke-1.5 stroke-primary size-4" />
                        View Event Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Skeleton className="h-5 w-40" />
              )}
              {eventPriceChange ? (
                <NumberFlowGroup>
                  <span className="flex items-center gap-1.5">
                    <NumberFlow
                      value={eventPriceChange.currentPrice ?? 0}
                      format={{
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }}
                      className="font-medium tabular-nums"
                    />
                    <ChangeText
                      value={eventPriceChange.percentChange!}
                      className="text-sm font-medium"
                    />
                  </span>
                </NumberFlowGroup>
              ) : (
                <Skeleton className="h-6 w-20" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              {eventMeta ? (
                <Link
                  prefetch={true}
                  href={`/event/${selectedEventId}`}
                  className="underline-offset-4 hover:underline"
                >
                  {formatVenue(
                    eventMeta.venueCity ?? "",
                    eventMeta.venueState ?? "",
                    eventMeta.venueExtendedAddress ?? "",
                  )}{" "}
                  • {eventMeta.venueName} •{" "}
                  {formatDate(eventMeta.localDatetime ?? "")}
                </Link>
              ) : (
                <Skeleton className="h-5 w-20" />
              )}
              <span className="text-muted-foreground text-xs font-medium">
                {TIME_WINDOWS[timeWindow].description}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pr-0">
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
