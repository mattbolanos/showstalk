"use client";

import { useEffect, useRef } from "react";

import { useTimeWindow, TIME_WINDOWS } from "@/stores/use-time-window";
import { cn } from "@/lib/utils";

const timeWindowOptions = Object.keys(TIME_WINDOWS).map((key) => key);

export function TimeWindowSelect({ className }: { className?: string }) {
  const { timeWindow, setTimeWindow } = useTimeWindow();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && timeWindow) {
      const activeTabElement = activeTabRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft;
        const clipRight = offsetLeft + offsetWidth;

        container.style.clipPath = `inset(0 ${Number(100 - (clipRight / container.offsetWidth) * 100).toFixed()}% 0 ${Number((clipLeft / container.offsetWidth) * 100).toFixed()}% round 17px)`;
      }
    }
  }, [timeWindow]);

  const handleSetTimeWindow = (timeWindow: keyof typeof TIME_WINDOWS) => {
    setTimeWindow(timeWindow);
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex w-fit flex-col items-center rounded-xs",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="bg-accent relative flex w-full justify-center">
          {timeWindowOptions.map((tab, index) => (
            <button
              key={index.toString()}
              type="button"
              onMouseDown={() =>
                handleSetTimeWindow(tab as keyof typeof TIME_WINDOWS)
              }
              className={cn(
                "text-accent-foreground flex h-9 items-center rounded-xs px-3 py-2 text-sm/5.5 font-medium tabular-nums",
              )}
              tabIndex={-1}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="relative flex w-full justify-center">
        {timeWindowOptions.map((tab, index) => {
          const isActive = timeWindow === tab;

          return (
            <button
              key={index.toString()}
              type="button"
              ref={isActive ? activeTabRef : null}
              onClick={() =>
                handleSetTimeWindow(tab as keyof typeof TIME_WINDOWS)
              }
              className="text-muted-foreground flex h-9 items-center rounded-xs px-3 py-2 text-sm/5.5 font-medium tabular-nums"
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
