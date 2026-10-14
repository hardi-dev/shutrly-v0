import { cn } from "@/ui/cn/cn";

import type { MetricSparkProps } from "./metric-spark.types";

/** Bar height as a share of the series maximum; an all-zero series has no bars (AC-DASH-034). @param value - the bar's count @param max - the largest count @returns the height in percent */
function barHeight(value: number, max: number): number {
  return max === 0 ? 0 : Math.round((value / max) * 100);
}

/** Draws a monthly series as bars, oldest first, with the last bar (the current month) highlighted. Decorative unless a spoken summary is given (C26). @param props - the series and an optional spoken summary @returns the sparkline */
export function MetricSpark({ values, label }: Readonly<MetricSparkProps>) {
  const max = Math.max(0, ...values);
  const decorative = label === undefined;
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? "true" : undefined}
      className="flex h-(--space-7) items-end gap-(--component-metric-spark-gap)"
    >
      {values.map((value, index) => (
        <span
          key={index}
          className={cn(
            "block w-(--space-1-5) rounded-(--component-metric-spark-radius)",
            index === values.length - 1
              ? "bg-(--component-metric-spark-current)"
              : "bg-(--component-metric-spark-bar)",
          )}
          style={{ height: `${String(barHeight(value, max))}%` }}
        />
      ))}
    </div>
  );
}
