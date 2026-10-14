import type { MetricRingProps } from "./metric-ring.types";

// A 28 px ring whose inner radius is 0.68 of its outer radius (design.md token-usage exception).
const SIZE = 28;
const OUTER_RADIUS = SIZE / 2;
const INNER_RADIUS = OUTER_RADIUS * 0.68;
const STROKE_WIDTH = OUTER_RADIUS - INNER_RADIUS;
const RING_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Draws the share `part / total` of a ring, empty for a zero share (AC-DASH-035). @param part - ready or waiting count @param total - the count the share is of @returns the share between 0 and 1 */
function shareOf(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(1, Math.max(0, part / total));
}

/** A ring showing how much of a live count is ready or waiting. It has a spoken label because it carries information (C26). @param props - the part, the total and the spoken label @returns the ring */
export function MetricRing({ part, total, label }: Readonly<MetricRingProps>) {
  const dash = `${String(shareOf(part, total) * CIRCUMFERENCE)} ${String(CIRCUMFERENCE)}`;
  return (
    <svg
      role="img"
      aria-label={label}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
      className="shrink-0"
    >
      <circle
        cx={OUTER_RADIUS}
        cy={OUTER_RADIUS}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        className="stroke-(--component-metric-spark-bar)"
      />
      <circle
        cx={OUTER_RADIUS}
        cy={OUTER_RADIUS}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={dash}
        transform={`rotate(-90 ${String(OUTER_RADIUS)} ${String(OUTER_RADIUS)})`}
        className="stroke-(--component-metric-spark-current)"
      />
    </svg>
  );
}
