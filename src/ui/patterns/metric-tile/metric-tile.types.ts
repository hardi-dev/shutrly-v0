import type { ReactNode } from "react";

export interface MetricTileProps {
  readonly label: string;
  /** The formatted value, such as "Rp 18,4 jt" or a count. */
  readonly value: string;
  /** A MetricDelta, or nothing when there is no change to show. */
  readonly delta?: ReactNode;
  /** A MetricSpark or MetricRing, or nothing. */
  readonly chart?: ReactNode;
}
