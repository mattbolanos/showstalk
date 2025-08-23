import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device supports touch input.
 * @returns boolean - true if touch device, false otherwise
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error: Some browsers use msMaxTouchPoints
      navigator.msMaxTouchPoints > 0;

    setIsTouch(checkTouch);
  }, []);

  return isTouch;
}