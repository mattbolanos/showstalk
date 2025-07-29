"use client";

import * as React from "react";
import Image from "next/image";

import { api, type RouterOutputs } from "@/trpc/react";

import { Button } from "./ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { DialogTitle } from "./ui/dialog";
import { formatDate, formatVenue } from "./event-card";
import { LoaderIcon, SearchIcon } from "lucide-react";

import { useRouter } from "next/navigation";

type EventResult = RouterOutputs["events"]["searchEvents"][number];
type TopEvent = RouterOutputs["events"]["getTrending"][number];

const createEventValue = (event: EventResult) => {
  const artistNames = event.eventArtists.map((artist) => artist.artist.name);
  return `${event.id} ${artistNames.join(", ")} ${event.name} ${event.venueName} ${event.venueCity} ${event.venueState}`;
};

const formatEventDate = (localDatetime: string) => {
  const date = new Date(localDatetime);
  return {
    weekday: date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }),
    date: date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    }),
  };
};

export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [debounceLoading, setDebounceLoading] = React.useState(false);

  React.useEffect(() => {
    setDebounceLoading(true);
    const timer = setTimeout(() => {
      setQuery(value);
      setDebounceLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [value]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: topEvents } = api.events.getTrending.useQuery();

  const {
    data: artistsResults,
    isLoading: artistsLoading,
    isPending: artistsPending,
  } = api.events.searchArtists.useQuery(
    {
      query,
    },
    { enabled: open && !!query },
  );

  const {
    data: eventsResults,
    isLoading: eventsLoading,
    isPending: eventsPending,
  } = api.events.searchEvents.useQuery(
    {
      query,
    },
    { enabled: open && !!query },
  );

  const isLoading = artistsLoading || debounceLoading || eventsLoading;
  const isPending = artistsPending || debounceLoading || eventsPending;

  const totalResults =
    (artistsResults?.length ?? 0) + (eventsResults?.length ?? 0);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setValue("");
    setQuery("");
  };

  const EventItem = ({
    event,
    href,
    type,
  }: {
    event: EventResult | TopEvent;
    href: string;
    type: "event" | "top";
  }) => {
    return (
      <CommandItem
        key={event.id}
        onSelect={() => {
          handleSelect(href);
        }}
        {...(type === "event" && {
          value: createEventValue(event as EventResult),
        })}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex w-10 flex-shrink-0 flex-col">
            <span className="text-primary text-sm font-semibold tabular-nums">
              {formatEventDate(event.localDatetime).date}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatEventDate(event.localDatetime).weekday}
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{event.name}</span>
            <p className="text-muted-foreground truncate text-xs">
              {formatVenue(event.venueCity, event.venueState)} •{" "}
              {event.venueName} • {formatDate(event.localDatetime)}
            </p>
          </div>
        </div>
      </CommandItem>
    );
  };

  return (
    <div className="flex w-full justify-center">
      <Button
        variant="outline"
        className="ring-input/60 bg-input hover:bg-input/80 relative w-full shrink-0 justify-start p-0 px-3 py-2 ring md:w-100"
        onMouseDown={() => setOpen(true)}
      >
        <span className="text-muted-foreground inline-flex pl-6 text-left text-base">
          Search for an artist or venue...
        </span>
        <kbd className="bg-muted pointer-events-none absolute top-1/2 right-1.5 hidden h-5 shrink-0 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100 select-none md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">
          Search for an artist or venue...
        </DialogTitle>
        <CommandInput
          placeholder="What concert are you looking for?"
          value={value}
          onValueChange={setValue}
          loading={isLoading}
        />
        <CommandList>
          <CommandEmpty className="flex h-16 items-center justify-center gap-2 md:h-18">
            {(isLoading || isPending) && totalResults === 0 ? (
              <div className="flex h-16 items-center justify-center gap-2 md:h-18">
                <LoaderIcon
                  aria-hidden="true"
                  className="text-primary size-4 animate-spin"
                />
                Searching...
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>

          {artistsResults && artistsResults.length > 0 && (
            <CommandGroup heading="Artists">
              {artistsResults.map((artist) => {
                const href = `/artist/${artist.id}`;
                router.prefetch(href);

                return (
                  <CommandItem
                    key={artist.id}
                    onSelect={() => {
                      handleSelect(href);
                    }}
                    value={artist.name}
                    className="flex items-center gap-3"
                  >
                    <div className="size-10 overflow-hidden rounded-full">
                      <Image
                        src={artist.image ?? ""}
                        alt={artist.name}
                        width={40}
                        height={40}
                        loading="eager"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{artist.name}</span>
                      <p className="text-muted-foreground text-sm">
                        {artist.genre}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {eventsResults && eventsResults.length > 0 && (
            <CommandGroup heading="Events">
              {eventsResults?.map((event) => {
                const href = `/event/${event.id}`;
                router.prefetch(href);

                return (
                  <EventItem
                    key={event.id}
                    href={href}
                    event={event}
                    type="event"
                  />
                );
              })}
            </CommandGroup>
          )}
          {!query && (
            <CommandGroup heading="Events">
              {topEvents?.map((event) => {
                const href = `/event/${event.id}`;
                router.prefetch(href);

                return (
                  <EventItem
                    key={event.id}
                    href={href}
                    event={event}
                    type="top"
                  />
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
