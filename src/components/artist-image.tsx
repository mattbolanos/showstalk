import Image from "next/image";

import { cn } from "@/lib/utils";

export function ArtistImage({
  imageUrl,
  artistName,
  className,
  containerClassName,
}: {
  imageUrl: string;
  artistName: string;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "bg-muted ring-foreground/70 overflow-hidden rounded-full ring",
        containerClassName,
      )}
    >
      <Image
        src={imageUrl}
        alt={artistName}
        width={48}
        height={48}
        className={cn("size-full object-cover", className)}
      />
    </div>
  );
}
