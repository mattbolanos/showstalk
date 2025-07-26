"use client";

import { api } from "@/trpc/react";

import * as React from "react";
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
import { SearchIcon } from "lucide-react";

import { useRouter } from "next/navigation";

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
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  const { data: topEvents } = api.events.getTrending.useQuery();

  const { data: artistsResults, isLoading: artistsLoading } =
    api.events.searchArtists.useQuery(
      {
        query,
      },
      { enabled: open && !!query },
    );

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

  const eventsResults = React.useMemo(() => {
    if (!query) return topEvents;
    return topEvents?.filter((event) =>
      event.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, topEvents]);

  const isLoading = artistsLoading || debounceLoading;

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
            {isLoading ? "" : "No results found."}
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
                      setOpen(false);
                      router.push(href);
                    }}
                  >
                    {artist.name}
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
                  <CommandItem
                    key={event.id}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/event/${event.id}`);
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <p className="text-muted-foreground text-xs">
                          {formatVenue(event.venueCity, event.venueState)} •{" "}
                          {event.venueName} • {formatDate(event.localDatetime)}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
