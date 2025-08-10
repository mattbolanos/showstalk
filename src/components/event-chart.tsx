"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

import { cn } from "@/lib/utils";

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
}: {
  eventMetrics: {
    fetchDate: string;
    minPriceTotal: number;
  }[];
  version?: "icon" | "full";
  trendDirection: "good" | "bad";
}) {
  const { spread, ticks } = React.useMemo(() => {
    if (eventMetrics.length < 2) return { spread: 0, ticks: [] };

    const { min, max } = eventMetrics.reduce(
      (acc, d) => ({
        min: Math.min(acc.min, d.minPriceTotal),
        max: Math.max(acc.max, d.minPriceTotal),
      }),
      {
        min: eventMetrics[0]?.minPriceTotal ?? 0,
        max: eventMetrics[0]?.minPriceTotal ?? 0,
      },
    );

    const rawSpread = (max - min) * 0.1;

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
  }, [eventMetrics]);

  const getDaysUntilEvent = (date: string): string => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(eventDate.getTime() - today.getTime());
    const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    return daysAway === 1
      ? "tomorrow"
      : daysAway === 0
        ? "today"
        : `${daysAway} days away`;
  };

  return (
    <div className={cn("px-6 pb-6", version === "icon" && "p-0")}>
      <ChartContainer
        config={{
          minPriceTotal: {
            label: "Min Price Total",
          },
        }}
        className={cn(
          "aspect-auto h-[250px] w-full pr-1",
          version === "icon" && "h-10 w-20 pr-0",
        )}
      >
        <AreaChart data={eventMetrics}>
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

            <linearGradient
              id="fillMinPriceTotalBad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
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
          {version === "full" && <CartesianGrid vertical={false} />}
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value as string).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      },
                    );
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
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
