export interface MetricSparkProps {
  /** Seven counts, oldest first; the last one is the current month. */
  readonly values: readonly number[];
  /** Spoken summary, e.g. "New projects per month, last 7 months". Omit to keep the chart decorative. */
  readonly label?: string;
}
