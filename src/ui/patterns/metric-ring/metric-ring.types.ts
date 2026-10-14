export interface MetricRingProps {
  /** The ready or waiting count. */
  readonly part: number;
  /** The count the share is of; the ring is drawn only when this is above zero. */
  readonly total: number;
  /** Spoken text, e.g. "1 of 2 waiting 3 days or more". */
  readonly label: string;
}
