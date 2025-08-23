"use client";

import * as React from "react";

export function useIsTouchDevice(): boolean {
  const getIsTouch = React.useCallback(() => {
    if (typeof window === "undefined") return false;

    const hasTouchPoints = (navigator as Navigator & { maxTouchPoints?: number })
      .maxTouchPoints
      ? (navigator as Navigator & { maxTouchPoints: number }).maxTouchPoints > 0
      : false;

    const hasCoarsePointer = window.matchMedia
      ? window.matchMedia("(pointer: coarse)").matches
      : false;

    const hasOntouch = "ontouchstart" in window || "ontouchstart" in document.documentElement;

    return hasTouchPoints || hasCoarsePointer || hasOntouch;
  }, []);

  const [isTouch, setIsTouch] = React.useState<boolean>(getIsTouch);

  React.useEffect(() => {
    setIsTouch(getIsTouch());

    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(pointer: coarse)");
    const handler = () => setIsTouch(getIsTouch());

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else if (typeof (mql as any).addListener === "function") {
      (mql as any).addListener(handler);
      return () => (mql as any).removeListener(handler);
    }
  }, [getIsTouch]);

  return isTouch;
}