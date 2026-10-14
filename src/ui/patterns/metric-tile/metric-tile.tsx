import type { ReactNode } from "react";

import type { MetricTileProps } from "./metric-tile.types";

/** One KPI: a label, a value, an optional delta and an optional chart (C26). The first row holds the label and the delta, the value takes the next line, and the chart sits bottom-right beside the value, as on the export. The DOM keeps the reading order label, value, delta (accessibility). @param props - label, value, delta and chart @returns the tile */
export function MetricTile({ label, value, delta, chart }: Readonly<MetricTileProps>) {
  return (
    <div className="relative flex flex-wrap items-start gap-x-(--space-2) gap-y-(--component-metric-tile-gap) rounded-(--component-metric-tile-radius) border border-(--component-metric-tile-border) bg-(--component-metric-tile-background) p-(--component-metric-tile-padding)">
      <p className="order-1 min-w-0 flex-1 text-(length:--font-size-label) font-semibold text-(--component-metric-tile-label)">
        {label}
      </p>
      <p className="order-3 w-full text-(length:--font-size-metric) font-bold tracking-(--font-letter-spacing-metric) text-(--component-metric-tile-value)">
        {value}
      </p>
      {optional(delta, "order-2 shrink-0")}
      {optional(
        chart,
        "absolute right-(--component-metric-tile-padding) bottom-(--component-metric-tile-padding)",
      )}
    </div>
  );
}

function optional(node: ReactNode, placement: string) {
  if (node === null || node === undefined) return null;
  return <div className={placement}>{node}</div>;
}
