"use client";

import * as React from "react";

import { api, type RouterOutputs } from "@/trpc/react";

import { Button } from "./ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { DialogTitle } from "./ui/dialog";
import { formatVenue } from "./event-card";
import {
  LoaderIcon,
  MicVocalIcon,
  SearchIcon,
  TicketIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useSearch } from "@/stores/use-search";
import Link from "next/link";

import { ArtistImage } from "./artist-image";

type EventResult = RouterOutputs["events"]["searchEvents"][number];
type TopEvent = RouterOutputs["events"]["getTrending"][number];
type ArtistResult = RouterOutputs["events"]["searchArtists"][number];

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
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }),
  };
};

export function SiteSearch() {
  const { searchOpen, setSearchOpen } = useSearch();
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [debounceLoading, setDebounceLoading] = React.useState(false);

  React.useEffect(() => {
    setDebounceLoading(true);
    const timer = setTimeout(() => {
      setQuery(value);
      setDebounceLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const { data: topEvents } = api.events.getTrending.useQuery();

  const {
    data: artistsResults,
    isLoading: artistsLoading,
    isPending: artistsPending,
  } = api.events.searchArtists.useQuery(
    {
      query,
    },
    { enabled: searchOpen && !!query && query.length > 1 },
  );

  const {
    data: eventsResults,
    isLoading: eventsLoading,
    isPending: eventsPending,
  } = api.events.searchEvents.useQuery(
    {
      query,
    },
    { enabled: searchOpen && !!query && query.length > 1 },
  );

  const isLoading = artistsLoading || debounceLoading || eventsLoading;
  const isPending = artistsPending || debounceLoading || eventsPending;

  const totalResults =
    (artistsResults?.length ?? 0) + (eventsResults?.length ?? 0);

  const handleSelect = () => {
    setSearchOpen(false);
    setValue("");
    setQuery("");
  };

  const EventItem = ({
    event,
    href,
  }: {
    event: EventResult | TopEvent;
    href: string;
  }) => {
    const eventDate = formatEventDate(event.localDatetime ?? "");

    return (
      <CommandItem key={event.id} onSelect={handleSelect} asChild>
        <Link href={href} prefetch={true}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex w-10 flex-shrink-0 flex-col">
              <span className="text-primary text-sm font-semibold tabular-nums">
                {eventDate.date}
              </span>
              <span className="text-muted-foreground text-xs">
                {eventDate.weekday}
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{event.name}</span>
              <p className="text-muted-foreground truncate text-xs tabular-nums">
                {formatVenue(
                  event.venueCity ?? "",
                  event.venueState ?? "",
                  event.venueExtendedAddress ?? "",
                )}{" "}
                • {event.venueName}
              </p>
            </div>
          </div>
        </Link>
      </CommandItem>
    );
  };

  const ArtistItem = ({
    artist,
    href,
  }: {
    artist: ArtistResult;
    href: string;
  }) => (
    <CommandItem
      key={artist.id}
      onSelect={handleSelect}
      className="flex items-center gap-3"
      asChild
    >
      <Link href={href} prefetch={true}>
        <ArtistImage
          imageUrl={artist.image ?? ""}
          artistName={artist.name}
          containerClassName="size-10"
        />
        <div className="flex flex-col">
          <span className="font-medium">{artist.name}</span>
          <p className="text-muted-foreground text-xs">{artist.genre}</p>
        </div>
      </Link>
    </CommandItem>
  );

  return (
    <div className="flex w-full justify-center px-6 md:px-0">
      <Button
        variant="outline"
        className="ring-input/60 bg-input hover:bg-input/80 relative w-full shrink-0 justify-start px-3 py-2 ring md:w-96"
        onMouseDown={() => setSearchOpen(true)}
      >
        <span className="text-muted-foreground inline-flex pl-6 text-left text-sm sm:text-base">
          Search for an artist or location...
        </span>
        <kbd className="bg-muted pointer-events-none absolute top-1/2 right-1.5 hidden h-5 shrink-0 -translate-y-1/2 items-center gap-1 rounded-sm border px-1.5 font-mono text-xs font-medium opacity-100 select-none md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
        </div>
      </Button>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogTitle className="sr-only">
          Search for an artist or venue...
        </DialogTitle>
        <CommandInput
          placeholder="Gaga Seattle, Red Rocks, or Chicago"
          value={value}
          onValueChange={setValue}
          loading={isLoading}
        />
        <CommandList>
          <Command shouldFilter={false}>
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
              <CommandGroup
                heading={
                  <span className="flex items-center gap-2">
                    <MicVocalIcon
                      size={16}
                      className="stroke-primary stroke-1.5"
                    />
                    Artists
                  </span>
                }
              >
                {artistsResults.map((artist) => (
                  <ArtistItem
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    artist={artist}
                  />
                ))}
              </CommandGroup>
            )}

            {eventsResults && eventsResults.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-2">
                    <TicketIcon
                      size={16}
                      className="stroke-primary stroke-1.5"
                    />
                    Events
                  </span>
                }
              >
                {eventsResults?.map((event) => (
                  <EventItem
                    key={event.id}
                    href={`/event/${event.id}`}
                    event={event}
                  />
                ))}
              </CommandGroup>
            )}
            {!query && (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-2">
                    <TrendingUpIcon
                      size={16}
                      className="stroke-primary stroke-1.5"
                    />
                    Trending
                  </span>
                }
              >
                {topEvents
                  ?.slice(0, 5)
                  .map((event) => (
                    <EventItem
                      key={event.id}
                      href={`/event/${event.id}`}
                      event={event}
                    />
                  ))}
              </CommandGroup>
            )}
          </Command>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
