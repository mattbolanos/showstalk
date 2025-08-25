import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";

export function ChangeText({
  value,
  className,
}: {
  value: number | undefined;
  className?: string;
}) {
  if (value === undefined) return null;

  return (
    <NumberFlow
      value={value}
      format={{
        style: "percent",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        signDisplay: "always",
      }}
      className={cn(
        "font-medium tabular-nums transition-colors duration-100",
        value < 0 ? "text-change-good" : "text-change-bad",
        className,
      )}
    />
  );
}
