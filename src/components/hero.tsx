"use client";

import * as React from "react";
import {
  AudioLinesIcon,
  GuitarIcon,
  MusicIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { type RouterOutputs } from "@/trpc/react";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { useSearch } from "@/stores/use-search";
import { Button } from "./ui/button";

export function Hero({
  trendingEventsPromise,
}: {
  trendingEventsPromise: Promise<RouterOutputs["events"]["getTrending"]>;
}) {
  const trendingEvents = React.use(trendingEventsPromise);
  const setSearchOpen = useSearch((state) => state.setSearchOpen);

  const handleGetStarted = () => {
    setSearchOpen(true);
  };

  return (
    <section className="relative w-full overflow-hidden py-4 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col items-center justify-between gap-16 lg:flex-row lg:gap-20">
          {/* Text Content */}
          <div className="w-full max-w-2xl text-center lg:text-left">
            <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-100">
              Never overpay for{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  concerts
                </span>
                <div className="absolute right-0 -bottom-0.5 left-0 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-60" />
              </span>
            </h1>
            <p className="text-muted-foreground mb-4 text-lg leading-relaxed sm:text-xl lg:text-2xl">
              Know when to buy. Know when to sell.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
              <Button
                onMouseDown={handleGetStarted}
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl"
              >
                <SearchIcon className="size-5" />
                Get Started
              </Button>
            </div>
          </div>

          {/* Visual Section */}
          <div className="relative h-96 w-full max-w-lg lg:h-110">
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-600/30 blur-3xl dark:from-pink-500/20 dark:to-purple-600/20" />

            {/* Floating Music Icons */}
            <div className="pointer-events-none absolute inset-0 z-20">
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
              className="absolute top-1/2 left-1/2 z-10 w-full max-w-md -translate-x-1/2 -translate-y-1/2 opacity-90"
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
                strokeWidth="4"
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

            {/* Price Ticker Cards */}
            {trendingEvents
              .sort((a, b) => a.weekChange - b.weekChange)
              .slice(0, 3)
              .map((event, index) => (
                <PriceTicker
                  key={event.artistName}
                  eventId={event.id}
                  artist={event.artistName}
                  price={event.minPriceTotal}
                  change={event.weekChange}
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
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceTicker({
  artist,
  eventId,
  price,
  change,
  className,
}: {
  artist: string;
  eventId: string;
  price: number;
  change: number;
  className?: string;
}) {
  const isUp = change > 0;

  return (
    <Card
      className={`z-20 w-36 gap-0 border-none p-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-xl hover:ring-2 ${className}`}
    >
      <Link
        href={`/event/${eventId}`}
        prefetch={true}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardContent className="space-y-1 p-3">
          <p className="text-sm font-semibold">{artist}</p>
          <p className="text-xl font-bold">${price}</p>
          {change !== 0 && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-red-600" : "text-emerald-500"}`}
            >
              {isUp ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              ${Math.abs(change)} this week
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
