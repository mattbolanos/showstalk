import {
  ArrowDownIcon,
  ArrowUpIcon,
  AudioLinesIcon,
  GuitarIcon,
  MusicIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Hero() {
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
                <div className="absolute right-0 -bottom-0.5 left-0 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-60"></div>
              </span>
            </h1>
            <p className="text-muted-foreground mb-4 text-lg leading-relaxed sm:text-xl lg:text-2xl">
              Know when to buy. Know when to sell.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
              <a
                href="#demo"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </a>
            </div>
          </div>

          {/* Visual Section */}
          <div className="relative h-96 w-full max-w-lg lg:h-110">
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 blur-3xl"></div>

            {/* Floating Music Icons */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="animate-drift absolute top-[12%] right-[38%] -rotate-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 p-3 shadow-lg [animation-delay:0.5s]">
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
            <PriceTicker
              artist="Taylor Swift"
              price={347}
              change={-23}
              changeText="today"
              className="animate-float absolute top-2 left-2 rotate-2"
            />
            <PriceTicker
              artist="The Weeknd"
              price={189}
              change={12}
              changeText="this week"
              className="animate-float absolute top-16 right-4 rotate-6 [animation-delay:2s]"
            />
            <PriceTicker
              artist="Billie Eilish"
              price={156}
              change={8}
              changeText="this hour"
              className="animate-float absolute bottom-16 left-6 -rotate-3 [animation-delay:4s]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceTicker({
  artist,
  price,
  change,
  changeText,
  className,
}: {
  artist: string;
  price: number;
  change: number;
  changeText: string;
  className?: string;
}) {
  const isUp = change > 0;

  return (
    <Card
      className={`z-20 w-36 gap-0 p-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="truncate text-sm font-semibold">
          {artist}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="mb-1 text-xl font-bold">${price}</div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}
        >
          {isUp ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )}
          ${Math.abs(change)} {changeText}
        </div>
      </CardContent>
    </Card>
  );
}
