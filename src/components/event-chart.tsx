"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

import { cn } from "@/lib/utils";
import { useTimeWindow } from "@/stores/use-time-window";

export const TIME_WINDOWS = {
  "2W": { days: 14, description: "Past 2 Weeks" },
  "1M": { days: 30, description: "Past Month" },
  "3M": { days: 90, description: "Past 3 Months" },
  "6M": { days: 180, description: "Past 6 Months" },
  ALL: { days: -1, description: "All Time" },
};

export function EventChart({
  eventMetrics,
  version,
  trendDirection,
  disableAnimations,
  className,
}: {
  eventMetrics: {
    fetchDate: Date | string;
    minPriceTotal: number;
  }[];
  version?: "icon" | "full";
  trendDirection: "good" | "bad";
  disableAnimations?: boolean;
  className?: string;
}) {
  const timeWindow = useTimeWindow((state) => state.timeWindow);

  const data = React.useMemo(() => {
    if (timeWindow === "ALL") return eventMetrics;

    return eventMetrics?.filter((metric) => {
      const diffTime = Math.abs(
        new Date(metric.fetchDate).getTime() - new Date().getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 2;
      return diffDays <= TIME_WINDOWS[timeWindow].days;
    });
  }, [eventMetrics, timeWindow]);

  const { spread, ticks } = React.useMemo(() => {
    if (data.length < 2) return { spread: 0, ticks: [] };

    const { min, max } = data.reduce(
      (acc, d) => ({
        min: Math.min(acc.min, d.minPriceTotal),
        max: Math.max(acc.max, d.minPriceTotal),
      }),
      {
        min: data[0]?.minPriceTotal ?? 0,
        max: data[0]?.minPriceTotal ?? 0,
      },
    );

    const rawSpread = (max - min) * 0.15;

    // Calculate nice tick values
    const minTick = Math.floor(min / 5) * 5; // Round down to nearest 5
    const maxTick = Math.ceil(max / 5) * 5; // Round up to nearest 5
    const tickSpacing = Math.max(5, Math.ceil((maxTick - minTick) / 5 / 5) * 5); // At most 5 ticks, rounded to nearest 5

    const tickValues = [];
    for (let tick = minTick; tick <= maxTick; tick += tickSpacing) {
      tickValues.push(tick);
    }

    return {
      spread: rawSpread,
      ticks: tickValues,
    };
  }, [data]);

  return (
    <ChartContainer
      config={{
        minPriceTotal: {
          label: "Min Price Total",
        },
      }}
      className={cn(
        "aspect-auto h-62 w-full pr-1",
        version === "icon" && "-my-2 h-12 w-23 pr-0",
        className,
      )}
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="fillMinPriceTotalGood"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-change-good)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-change-good)"
              stopOpacity={0.1}
            />
          </linearGradient>

          <linearGradient id="fillMinPriceTotalBad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-change-bad)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-change-bad)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          className={cn(version === "icon" && "hidden")}
        />

        {version === "full" && (
          <YAxis
            dataKey="minPriceTotal"
            tickLine={false}
            allowDecimals={false}
            interval={"preserveStartEnd"}
            type="number"
            orientation="right"
            axisLine={false}
            min={0}
            ticks={ticks}
            domain={[
              (dataMin: number) => dataMin - spread,
              (dataMax: number) => dataMax + spread,
            ]}
            tick={{ fontWeight: 500 }}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              return `$${value}`;
            }}
          />
        )}
        {version === "full" && (
          <XAxis
            dataKey="fetchDate"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={48}
            interval={"preserveStart"}
            tickFormatter={(value) => {
              return new Date(value as string).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              });
            }}
          />
        )}
        {version === "full" && (
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  });
                }}
                indicator="dot"
                formatter={(value) => {
                  return (
                    <>
                      Starting At:{" "}
                      <span className="font-medium">
                        {value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                          useGrouping: true,
                        })}
                      </span>
                    </>
                  );
                }}
              />
            }
          />
        )}

        <Area
          dataKey="minPriceTotal"
          type="natural"
          fill={
            trendDirection === "good"
              ? "url(#fillMinPriceTotalGood)"
              : "url(#fillMinPriceTotalBad)"
          }
          stroke={
            trendDirection === "good"
              ? "var(--color-change-good)"
              : "var(--color-change-bad)"
          }
          animationDuration={800}
          isAnimationActive={!disableAnimations}
        />
      </AreaChart>
    </ChartContainer>
  );
}
