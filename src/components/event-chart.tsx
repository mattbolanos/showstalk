"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { RouterOutputs } from "@/trpc/react";

type EventMeta = RouterOutputs["events"]["getEventMeta"];

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
}: {
  eventMetrics: {
    fetchDate: string;
    minPriceTotal: number;
  }[];
  eventMeta: EventMeta;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {eventMeta?.name} @ {eventMeta?.venueName}, {eventMeta?.venueCity}
        </CardTitle>
        <CardDescription>
          {formatDate(eventMeta?.localDatetime ?? "")} • Get-in prices with fees
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 sm:p-3">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={eventMetrics}>
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
                const date = new Date(value as string);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
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
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
