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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  minPriceTotal: {
    label: "Min Price Total",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function EventChart({
  initialDataPromise,
}: {
  initialDataPromise: Promise<
    {
      fetchDate: string;
      minPriceTotal: number;
    }[]
  >;
}) {
  const data = React.use(initialDataPromise);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Chart</CardTitle>
        <CardDescription>
          This is a chart of the event&apos;s min price total over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
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
                    return `Min Price: ${value.toLocaleString("en-US", {
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

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
