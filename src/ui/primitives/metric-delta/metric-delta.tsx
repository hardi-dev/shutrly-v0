import { cn } from "@/ui/cn/cn";

import type { MetricDeltaProps } from "./metric-delta.types";

const TONE_CLASSES = {
  positive:
    "bg-(--component-metric-delta-positive-background) text-(--component-metric-delta-positive-text)",
  warning:
    "bg-(--component-metric-delta-warning-background) text-(--component-metric-delta-warning-text)",
} as const;

/** A small change indicator on a metric tile (C15). With `srText`, the visible value is hidden from assistive tech and the spoken text replaces it (AC-DASH-033). @param props - tone, visible value and optional spoken text @returns the badge */
export function MetricDelta({ tone, value, srText }: Readonly<MetricDeltaProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--component-metric-delta-radius) px-(--component-metric-delta-padding-x) py-(--component-metric-delta-padding-y) text-(length:--font-size-caption) font-bold whitespace-nowrap",
        TONE_CLASSES[tone],
      )}
    >
      {srText === undefined ? (
        value
      ) : (
        <>
          <span aria-hidden="true">{value}</span>
          <span className="sr-only">{srText}</span>
        </>
      )}
    </span>
  );
}
