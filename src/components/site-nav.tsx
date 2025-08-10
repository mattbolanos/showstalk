import { FlameIcon } from "lucide-react";

import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";

import Link from "next/link";

export function SiteNav() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b px-4 backdrop-blur md:px-6">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center">
        <Link
          prefetch={true}
          href="/"
          className="flex flex-1 items-center justify-center gap-1 hover:opacity-80"
        >
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <p className="text-primary text-lg font-semibold">Showstalk</p>
        </Link>
        {/* Search form */}
        <SiteSearch />

        <ThemeToggle />
      </div>
    </header>
  );
}
