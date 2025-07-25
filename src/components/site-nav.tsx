import { FlameIcon } from "lucide-react";

import { SiteSearch } from "./site-search";

export function SiteNav() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-13 items-center">
        <div className="flex flex-1 items-center justify-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <p className="text-primary text-lg font-semibold">Showstalk</p>
        </div>
        {/* Search form */}
        <SiteSearch />

        <div className="flex items-center justify-center gap-1">
          <FlameIcon
            size={28}
            className="fill-primary stroke-orange-500/20"
            strokeWidth={2}
          />
          <p className="text-primary text-lg font-semibold">Showstalk</p>
        </div>
      </div>
    </header>
  );
}
