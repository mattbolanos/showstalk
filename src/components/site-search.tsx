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
import { SearchIcon } from "lucide-react";

export function SiteSearch() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { data: topEvents } = api.events.getTrending.useQuery();

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

  const data = React.useMemo(() => {
    if (!value) return topEvents;
    return topEvents?.filter((event) =>
      event.name.toLowerCase().includes(value.toLowerCase()),
    );
  }, [value, topEvents]);

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
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Top Events">
            {data?.map((event) => (
              <CommandItem key={event.id}>{event.name}</CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
