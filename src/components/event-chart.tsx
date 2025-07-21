"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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

const TIME_WINDOWS = {
  "2W": 14,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  ALL: -1,
};

const chartConfig = {
  minPriceTotal: {
    label: "Min Price Total",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

const formatDate = (date: string) => {
  return new Date(date)
    .toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    })
    .replace(",", "");
};

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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= TIME_WINDOWS[selectedTimeWindow];
    });
  }, [eventMetrics, selectedTimeWindow]);

  const trend = React.useMemo(() => {
    if (data.length < 2 || !data[0] || !data[data.length - 1]) return 0;
    return (
      (data?.[data.length - 1]?.minPriceTotal ?? 0) -
      (data?.[0]?.minPriceTotal ?? 0)
    );
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isLoading ? (
            <Skeleton className="h-4 w-30" />
          ) : (
            <>
              {eventMeta?.name} @ {eventMeta?.venueName}, {eventMeta?.venueCity}
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              {formatDate(eventMeta?.localDatetime ?? "")} • Get-in prices with
              fees
            </>
          )}
        </CardDescription>
        <div className="flex items-center justify-between gap-4">
          {/* Price trend */}
          <span className="flex items-center gap-2">
            <p className="font-semibold tabular-nums">
              {`$${data?.[data.length - 1]?.minPriceTotal}`}
            </p>
            <p
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium tabular-nums",
                trend > 0 && "text-emerald-500",
                trend < 0 && "text-rose-500",
              )}
            >
              {trend > 0 && <ArrowUpIcon className="size-4" />}
              {trend < 0 && <ArrowDownIcon className="size-4" />}$
              {Math.abs(trend)}
            </p>
          </span>

          {/* Time window selector */}
          <div className="flex w-full justify-end gap-2">
            {Object.keys(TIME_WINDOWS).map((timeWindow) => (
              <Button
                key={timeWindow}
                onClick={() =>
                  setSelectedTimeWindow(timeWindow as keyof typeof TIME_WINDOWS)
                }
                variant={
                  timeWindow === selectedTimeWindow ? "default" : "ghost"
                }
                className={cn(
                  "h-8 w-9 rounded-md p-2 text-xs whitespace-nowrap",
                  timeWindow !== selectedTimeWindow && "hover:bg-primary/10",
                  timeWindow === selectedTimeWindow &&
                    "text-primary-foreground",
                )}
              >
                {timeWindow}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pr-2 pl-1 sm:pr-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
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
                axisLine={false}
                min={0}
                // domain={["auto", "dataMax + 50"]}
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
                minTickGap={32}
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
                      return `Starting At: ${value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        notation: "compact",
                      })}`;
                    }}
                  />
                }
              />
              <Area
                dataKey="minPriceTotal"
                type="natural"
                fill="url(#fillMinPriceTotal)"
                stroke="var(--color-primary)"
                stackId="a"
                animationDuration={800}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
