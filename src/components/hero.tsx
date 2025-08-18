"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { useSearch } from "@/stores/use-search";
import { Button } from "./ui/button";

export function Hero() {
  const setSearchOpen = useSearch((state) => state.setSearchOpen);

  const handleGetStarted = () => {
    setSearchOpen(true);
  };

  return (
    <div className="w-full max-w-2xl text-center lg:text-left">
      <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-100">
        Never overpay for{" "}
        <span className="relative">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            concerts
          </span>
          <div className="absolute right-0 -bottom-0.5 left-0 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-60" />
        </span>
      </h1>
      <p className="text-muted-foreground mb-4 text-lg leading-relaxed sm:text-xl lg:text-2xl">
        Know when to buy. Know when to sell.
      </p>
      <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
        <Button
          onMouseDown={handleGetStarted}
          size="lg"
          className="h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl"
        >
          <SearchIcon className="size-5" />
          Get Started
        </Button>
      </div>
    </div>
  );
}
