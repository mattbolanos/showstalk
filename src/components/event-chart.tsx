"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "./ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Skeleton } from "./ui/skeleton";

import type { RouterOutputs } from "@/trpc/react";

import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

type EventMeta = RouterOutputs["events"]["getEventMeta"];

export const TIME_WINDOWS = {
  "2W": { days: 14, description: "Past 2 Weeks" },
  "1M": { days: 30, description: "Past Month" },
  "3M": { days: 90, description: "Past 3 Months" },
  "6M": { days: 180, description: "Past 6 Months" },
  ALL: { days: -1, description: "All Time" },
};

const chartConfig = {
  minPriceTotal: {
    label: "Min Price Total",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function EventChart({
  eventMetrics,
  eventMeta,
  isLoading,
}: {
  eventMetrics: {
    fetchDate: string;
    minPriceTotal: number;
  }[];
  eventMeta: EventMeta;
  isLoading?: boolean;
}) {
  const [selectedTimeWindow, setSelectedTimeWindow] =
    React.useState<keyof typeof TIME_WINDOWS>("1M");

  const data = React.useMemo(() => {
    if (selectedTimeWindow === "ALL") return eventMetrics;

    return eventMetrics.filter((metric) => {
      const date = new Date(metric.fetchDate);
      const diffTime = Math.abs(date.getTime() - new Date().getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 2;
      return diffDays <= TIME_WINDOWS[selectedTimeWindow].days;
    });
  }, [eventMetrics, selectedTimeWindow]);

  const trend = React.useMemo(() => {
    if (data.length < 2 || !data[0] || !data[data.length - 1]) return 0;
    return (
      (data?.[data.length - 1]?.minPriceTotal ?? 0) -
      (data?.[0]?.minPriceTotal ?? 0)
    );
  }, [data]);

  const { spread, ticks } = React.useMemo(() => {
    if (data.length < 2) return { spread: 0, ticks: [] };

    const { min, max } = data.reduce(
      (acc, d) => ({
        min: Math.min(acc.min, d.minPriceTotal),
        max: Math.max(acc.max, d.minPriceTotal),
      }),
      { min: data[0]?.minPriceTotal ?? 0, max: data[0]?.minPriceTotal ?? 0 },
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
  }, [data]);

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
    <div className="px-6 pb-6">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full pr-1"
      >
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="fillMinPriceTotal"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
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
            <Area
              dataKey="minPriceTotal"
              type="natural"
              fill="url(#fillMinPriceTotal)"
              stroke="var(--color-primary)"
              animationDuration={800}
            />
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  );
}
