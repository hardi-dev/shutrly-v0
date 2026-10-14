import type { ReactNode } from "react";

import type { MetricTileProps } from "./metric-tile.types";

/** One KPI: a label, a value, an optional delta and an optional chart (C26). The grid places the label and the delta on the first row, and the value and the chart on the second, while the DOM keeps the reading order label, value, delta (accessibility). @param props - label, value, delta and chart @returns the tile */
export function MetricTile({ label, value, delta, chart }: Readonly<MetricTileProps>) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-(--space-2) gap-y-(--component-metric-tile-gap) rounded-(--component-metric-tile-radius) border border-(--component-metric-tile-border) bg-(--component-metric-tile-background) p-(--component-metric-tile-padding)">
      <p className="row-start-1 col-start-1 min-w-0 text-(length:--font-size-label) font-semibold text-(--component-metric-tile-label)">
        {label}
      </p>
      <p className="row-start-2 col-start-1 min-w-0 self-end text-(length:--font-size-metric) font-bold tracking-(--font-letter-spacing-metric) text-(--component-metric-tile-value)">
        {value}
      </p>
      {optional(delta, "row-start-1 col-start-2 justify-self-end")}
      {optional(chart, "row-start-2 col-start-2 self-end justify-self-end")}
    </div>
  );
}

function optional(node: ReactNode, placement: string) {
  if (node === null || node === undefined) return null;
  return <div className={placement}>{node}</div>;
}
