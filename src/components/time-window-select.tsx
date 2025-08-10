"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";

import { TIME_WINDOWS, useTimeWindow } from "@/stores/use-time-window";
import { cn } from "@/lib/utils";

const timeWindowOptions = Object.keys(TIME_WINDOWS).map((key) => key);

export function TimeWindowSelect() {
  const { timeWindow, setTimeWindow } = useTimeWindow();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });

  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeIndex = timeWindowOptions.findIndex((opt) => opt === timeWindow);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const firstElement = tabRefs.current[0];
      if (firstElement) {
        const { offsetLeft, offsetWidth } = firstElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="relative flex w-full items-center justify-center border-none shadow-none">
        <CardContent className="p-0">
          <div className="relative">
            {/* Hover Highlight */}
            <div
              className="bg-accent absolute flex h-[30px] items-center rounded-[6px] transition-all duration-300 ease-out"
              style={{
                ...hoverStyle,
                opacity: hoveredIndex !== null ? 1 : 0,
              }}
            />

            {/* Active Indicator */}
            <div
              className="bg-accent absolute h-[30px] rounded-[6px] transition-all duration-300 ease-out"
              style={activeStyle}
            />

            {/* Tabs */}
            <div className="relative flex items-center space-x-3">
              {timeWindowOptions.map((option, index) => (
                <div
                  key={option}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  className={cn(
                    "h-[30px] cursor-pointer px-3 py-2 transition-colors duration-300",
                    index === activeIndex
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() =>
                    setTimeWindow(option as keyof typeof TIME_WINDOWS)
                  }
                >
                  <div className="flex h-full items-center justify-center text-sm leading-5 font-medium whitespace-nowrap">
                    {option}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
