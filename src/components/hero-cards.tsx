"use client";

import { MusicIcon, GuitarIcon, AudioLinesIcon } from "lucide-react";
import { api, type RouterOutputs } from "@/trpc/react";

import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { ChangeText } from "./change-text";
import { cn } from "@/lib/utils";

type TrendingEvents = RouterOutputs["events"]["getTrending"];

export const HeroCardVisual = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative h-96 w-full lg:h-110 lg:max-w-3xl">
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-600/30 blur-3xl dark:from-pink-500/20 dark:to-purple-600/20" />

      {/* Floating Music Icons */}
      <div className="pointer-events-none absolute inset-0 z-5">
        <div className="animate-drift absolute top-[9%] right-[42%] -rotate-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 p-3 shadow-lg [animation-delay:0.5s]">
          <MusicIcon className="size-6 stroke-white stroke-2" />
        </div>
        <div className="animate-drift absolute top-[35%] left-[15%] rotate-[15deg] rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg [animation-delay:2.5s]">
          <GuitarIcon className="size-6 stroke-white stroke-2" />
        </div>
        <div className="animate-drift absolute right-[22%] bottom-[32%] -rotate-[8deg] rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg [animation-delay:3.8s]">
          <AudioLinesIcon className="size-6 stroke-white stroke-2" />
        </div>
      </div>

      {/* Animated Soundwaves */}
      <svg
        className="absolute top-1/2 left-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 opacity-90"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
            <stop offset="50%" stopColor="#a855f7" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* Soundwave paths with smooth animations */}
        <path
          d="M0 180 Q100 100 200 180 T400 180"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        >
          <animate
            attributeName="d"
            values="M0 180 Q100 100 200 180 T400 180;M0 180 Q100 140 200 180 T400 180;M0 180 Q100 100 200 180 T400 180"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M0 150 Q100 70 200 150 T400 150"
          stroke="url(#waveGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M0 150 Q100 70 200 150 T400 150;M0 150 Q100 110 200 150 T400 150;M0 150 Q100 70 200 150 T400 150"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M0 120 Q100 40 200 120 T400 120"
          stroke="url(#waveGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        >
          <animate
            attributeName="d"
            values="M0 120 Q100 40 200 120 T400 120;M0 120 Q100 80 200 120 T400 120;M0 120 Q100 40 200 120 T400 120"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M0 90 Q100 10 200 90 T400 90"
          stroke="url(#waveGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M0 90 Q100 10 200 90 T400 90;M0 90 Q100 50 200 90 T400 90;M0 90 Q100 10 200 90 T400 90"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M0 60 Q100 -20 200 60 T400 60"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        >
          <animate
            attributeName="d"
            values="M0 60 Q100 -20 200 60 T400 60;M0 60 Q100 20 200 60 T400 60;M0 60 Q100 -20 200 60 T400 60"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {children ?? (
        <>
          <div className="animate-float absolute top-2 left-6 -rotate-8">
            <div className="h-24 w-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 shadow-lg" />
          </div>
          <div className="animate-float absolute top-22 right-4 rotate-5 [animation-delay:2s]">
            <div className="h-24 w-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 shadow-lg" />
          </div>
          <div className="animate-float absolute bottom-19 left-12 rotate-4 [animation-delay:4s]">
            <div className="h-24 w-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 shadow-lg" />
          </div>
        </>
      )}
    </div>
  );
};

export function HeroCards({ topEvents }: { topEvents: TrendingEvents }) {
  return (
    <HeroCardVisual>
      {/* Price Ticker Cards */}
      {topEvents.map((event, index) => (
        <PriceTicker
          key={event.artistName}
          eventId={event.id}
          artist={event.artistName!}
          price={event.minPriceTotal}
          className={cn(
            "animate-float absolute",
            index === 0 && "top-2 left-6 -rotate-8 hover:ring-pink-500",
            index === 1 &&
              "top-22 right-4 rotate-5 [animation-delay:2s] hover:ring-purple-500",
            index === 2 &&
              "bottom-19 left-12 rotate-4 [animation-delay:4s] hover:ring-indigo-500",
          )}
        />
      ))}
    </HeroCardVisual>
  );
}

function PriceTicker({
  artist,
  eventId,
  price,
  className,
}: {
  artist: string;
  eventId: string;
  price: number;
  className?: string;
}) {
  const { data: priceChange } = api.events.getEventPriceChange.useQuery(
    {
      eventId,
      windowDays: 14,
    },
    {
      enabled: !!eventId,
    },
  );

  return (
    <Card
      className={`z-6 w-36 gap-0 border-none p-0 shadow-lg backdrop-blur-xs transition-all duration-200 hover:scale-105 hover:shadow-xl hover:ring-2 ${className}`}
    >
      <Link
        href={`/event/${eventId}`}
        prefetch={true}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardContent className="space-y-1 p-3">
          <p className="text-sm font-semibold">{artist}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-xl font-bold">${price}</p>
            <ChangeText value={priceChange?.percentChange ?? 0} />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
