import { ArrowDown, ArrowUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="relative z-20 container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
        <div className="max-w-lg">
          <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl dark:text-gray-100">
            Never overpay for{" "}
            <span className="relative text-pink-600">
              concerts
              <span className="absolute bottom-[-8px] left-0 h-[4px] w-full rounded-sm bg-gradient-to-r from-pink-500 to-fuchsia-500"></span>
            </span>{" "}
            again
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-300">
            Our intelligent price tracking reveals the perfect moment to buy
            tickets. See real-time price movements, historical trends, and get
            alerts when your favorite artists hit their optimal price point.
          </p>
          <a
            href="#demo"
            className="inline-block cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Track Your First Show
          </a>
        </div>
        <div className="relative hidden h-96 md:block">
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="animate-drift absolute top-[10%] right-[10%] text-2xl">
              🎵
            </div>
            <div className="animate-drift absolute top-[20%] right-[15%] text-2xl [animation-delay:5s]">
              🎸
            </div>
            <div className="animate-drift absolute bottom-[30%] left-[20%] text-2xl [animation-delay:10s]">
              🎤
            </div>
            <div className="animate-drift absolute right-[25%] bottom-[10%] text-2xl [animation-delay:15s]">
              🎹
            </div>
          </div>
          <svg
            className="absolute top-1/2 left-1/2 z-10 h-[180px] w-[300px] -translate-x-1/2 -translate-y-1/2 opacity-10"
            viewBox="0 0 300 180"
          >
            <defs>
              <pattern
                id="grid"
                width="30"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  className="stroke-pink-500/30"
                  strokeWidth="1"
                  d="M 30 0 L 0 0 0 20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
              className="fill-none stroke-pink-500/60"
              strokeWidth="2"
              d="M0,140 Q75,120 150,90 Q225,70 300,50"
            />
          </svg>
          <PriceTicker
            artist="Taylor Swift"
            price={347}
            change={-23}
            changeText="today"
            className="animate-float top-0 left-0"
          />
          <PriceTicker
            artist="The Weeknd"
            price={189}
            change={12}
            changeText="this week"
            className="animate-float top-20 right-5 [animation-delay:2s]"
          />
          <PriceTicker
            artist="Billie Eilish"
            price={156}
            change={8}
            changeText="this hour"
            className="animate-float bottom-16 left-8 [animation-delay:4s]"
          />
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
    <div
      className={`absolute rounded-2xl border border-white/20 bg-white/60 p-4 shadow-lg backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-800/60 ${className}`}
    >
      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {artist}
      </div>
      <div className="mb-1 text-2xl font-bold text-pink-600 dark:text-pink-500">
        ${price}
      </div>
      <div
        className={`flex items-center gap-1 text-xs ${
          isUp ? "text-green-500" : "text-red-500"
        }`}
      >
        {isUp ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
        ${Math.abs(change)} {changeText}
      </div>
    </div>
  );
}
