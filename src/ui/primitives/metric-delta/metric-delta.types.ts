export type MetricDeltaTone = "positive" | "warning";

export interface MetricDeltaProps {
  readonly tone: MetricDeltaTone;
  /** The visible text, such as "+1" or "−2". */
  readonly value: string;
  /** Spoken text in place of the visible value, e.g. "+1 compared with the same days last month". */
  readonly srText?: string;
}
