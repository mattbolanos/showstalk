import { FlameIcon } from "lucide-react";

export function SiteNav() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-13 items-center justify-between gap-4">
        <div className="flex items-center gap-1">
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
